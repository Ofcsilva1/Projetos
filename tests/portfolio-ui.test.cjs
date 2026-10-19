const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
let browser;
before(async()=>{browser=await chromium.launch({headless:true,...(process.env.PORTFOLIO_BROWSER_PATH?{executablePath:process.env.PORTFOLIO_BROWSER_PATH}:{})});});
after(async()=>{await browser?.close();});
async function pageFor(file,width=1440){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.hostname!=='portfolio.test')return route.abort();
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    const rel=path.relative(root,file);
    if(rel.startsWith('..')||path.isAbsolute(rel))return route.abort();
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file))return route.abort();
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff'};
    return route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://portfolio.test/'+file,{waitUntil:'networkidle'});
  return {context,page,errors};
}
test('built Paradise has real navigation links and recovers malformed anchors',async()=>{
  const {context,page,errors}=await pageFor('paradise-island/');
  try{
    if(process.env.PORTFOLIO_QA_DIR)await page.screenshot({path:path.join(process.env.PORTFOLIO_QA_DIR,'paradise-desktop.png')});
    const nav=page.getByRole('navigation',{name:'Navegação principal',exact:true});
    assert.equal(await nav.getByRole('link').count(),6);
    assert.equal(await nav.getByRole('radio').count(),0);
    const link=nav.getByRole('link',{name:'A ilha',exact:true});
    assert.ok(await link.getAttribute('href'));
    // Resolve the copied native href in another tab, independent of popup policy.
    const target=new URL(await link.getAttribute('href'),page.url()).href;
    const tab=await context.newPage();await tab.goto(target,{waitUntil:'networkidle'});assert.ok(await tab.locator('main h1').isVisible());await tab.close();
    await page.goto('https://portfolio.test/paradise-island/#/ilha#%',{waitUntil:'networkidle'});
    await page.waitForTimeout(70);assert.ok(await page.locator('main h1').isVisible());
    await nav.getByRole('link',{name:'Galeria',exact:true}).focus();await page.keyboard.press('Enter');
    await page.waitForURL('**/#/galeria');
    await page.waitForFunction(()=>document.activeElement?.id==='conteudo');
    assert.equal(await nav.getByRole('link',{name:'Galeria',exact:true}).getAttribute('aria-current'),'page');
    const first=page.getByRole('button',{name:/^Ampliar:/}).first();await first.focus();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor({state:'visible'});
    await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'detached'});await page.waitForFunction(()=>document.querySelector('.gallery-item')===document.activeElement);
    assert.equal(await first.evaluate(el=>el===document.activeElement),true);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
test('mobile Paradise keeps gallery filters and menu operable',async()=>{
  const {context,page,errors}=await pageFor('paradise-island/#/galeria',390);
  try{
    if(process.env.PORTFOLIO_QA_DIR)await page.screenshot({path:path.join(process.env.PORTFOLIO_QA_DIR,'paradise-mobile.png')});
    await page.getByRole('radio',{name:'Mar',exact:true}).click();
    assert.equal(await page.getByRole('radio',{name:'Mar',exact:true}).getAttribute('aria-checked'),'true');
    await page.getByRole('button',{name:'Abrir menu',exact:true}).click();assert.equal(await page.getByRole('dialog').isVisible(),true);
    await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
test('existing workbook still opens data, analyses and the year filter',async()=>{
  for(const width of [1440,390]){
    const {context,page,errors}=await pageFor('Importador_Excel_Dados.html',width);
    try{
      await page.locator('input[type=file]').setInputFiles(path.join(root,'Previdencia_Privada_Portfolio.xlsx'));
      await page.waitForFunction(()=>document.querySelectorAll('#data-table tbody tr').length>0);
      await page.locator('#analysis-button').click();await page.waitForFunction(()=>document.querySelector('#page-analysis').innerText.length>500);
      await page.locator('#visual-button').click();await page.locator('#dash-filter-period').waitFor();
      const year=page.locator('#dash-filter-period option[value=year]');assert.equal(await year.textContent(),'Ano da última competência');
      await page.locator('#dash-filter-period').selectOption('year');
      assert.equal(await page.locator('#dash-filter-period').inputValue(),'year');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
});
test('GBS labels describe BO and recorded attendance without changing formulas',async()=>{
  const {context,page,errors}=await pageFor('Dashboard_GBS- prontuario.html',390);
  try{
    await page.locator('#menuButton').click();
    const item=page.locator('[data-view="dropout"]');await item.click();
    assert.match(await page.locator('#content').textContent(),/Sem atendimento psicossocial registrado/);
    assert.doesNotMatch(await page.locator('#content').textContent(),/Evasão/);
    await page.locator('#menuButton').click();await page.locator('[data-view="violence"]').click();assert.match(await page.locator('#content').textContent(),/Casos com BO/);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
test('portfolio materials have direct destinations and a responsive layout',async()=>{
  for(const width of [1440,390]){
    const {context,page,errors}=await pageFor('',width);
    try{
      assert.equal(await page.locator('.project-card').count(),8);
      assert.equal(await page.locator('.material-list a[href$=".pdf"]').count(),2);
      const tool=page.locator('a[href="Importador_Excel_Dados.html"]');assert.equal(await tool.count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      if(process.env.PORTFOLIO_QA_DIR)await page.screenshot({path:path.join(process.env.PORTFOLIO_QA_DIR,`portfolio-${width}.png`)});
      await tool.click();assert.match(await page.title(),/Planilha em foco/);assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
});
