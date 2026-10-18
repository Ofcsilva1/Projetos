const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./helpers/browser-fixture.cjs');
function luminance(rgb){const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
function ratio(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('normal text, placeholders, primary buttons and input borders have measured contrast in both themes',async()=>{
 const {page,context}=await fixture();try{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const theme of ['light','dark']){
   await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.bsTheme=theme;},theme);
   await page.locator('#nav-new').click();
   const styles=await page.evaluate(()=>{
    const input=getComputedStyle(document.querySelector('#numero-prontuario')),placeholder=getComputedStyle(document.querySelector('#numero-prontuario'),'::placeholder');
    const label=getComputedStyle(document.querySelector('label[for="numero-prontuario"]')),panel=getComputedStyle(document.querySelector('.form-card'));
    const button=getComputedStyle(document.querySelector('#btnSalvarCaso'));
    return {input:[input.color,input.backgroundColor],placeholder:[placeholder.color,input.backgroundColor],label:[label.color,panel.backgroundColor],button:[button.color,button.backgroundColor],border:[input.borderTopColor,input.backgroundColor],font:parseFloat(input.fontSize)};
   });
   for(const key of ['input','placeholder','label','button'])assert.ok(ratio(...styles[key])>=4.5,`${theme}/${key}: ${ratio(...styles[key])}`);
   assert.ok(ratio(...styles.border)>=3,`${theme}/border`);assert.ok(styles.font>=16);
   await page.locator('#btnSalvarCaso').hover();const hover=await page.locator('#btnSalvarCaso').evaluate(el=>{const s=getComputedStyle(el);return[s.color,s.backgroundColor];});assert.ok(ratio(...hover)>=4.5);
   assert.equal(await page.locator('#btnPreviousStep').evaluate(el=>getComputedStyle(el).cursor),'not-allowed');
   await page.locator('#nav-list').click();await page.locator('.btnEditar').first().click();
   const readonly=await page.locator('#numero-prontuario').evaluate(el=>({style:getComputedStyle(el).borderTopStyle,readonly:el.readOnly}));assert.deepEqual(readonly,{style:'dashed',readonly:true});
   await page.locator('#nav-list').click();
  }
 }finally{await context.close();}
});
test('refined login, list, form and dialog fit 320, 390, 768 and 1440px in both themes',async()=>{
 const {page,context}=await fixture({noLogin:true});try{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:640});
  const auth=await page.locator('.auth-theme-toggle,.auth-box').evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect();return{top:b.top,bottom:b.bottom,left:b.left,right:b.right};}));
  assert.ok(auth[0].bottom<=auth[1].top);assert.ok(auth.every(b=>b.left>=0&&b.right<=320));
  if(process.env.NEXO_QA_DIR)await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,'fase4-login-320.png')});
  await page.locator('#btnLogin').click();
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   for(const theme of ['light','dark']){
    await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.bsTheme=theme;},theme);
    for(const [id,name] of [['nav-list','casos'],['nav-new','cadastro'],['nav-agenda','agenda']]){
     await page.locator('#'+id).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}/${theme}/${name}`);
     if(process.env.NEXO_QA_DIR)await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,`fase4-${name}-${width}-${theme}.png`)});
    }
    await page.locator('#agenda-new').click();const dialog=page.locator('#workflow-dialog');await dialog.waitFor({state:'visible'});
    const box=await dialog.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);assert.ok(box.y>=0&&box.y+box.height<=1000);
    assert.equal(await page.locator('#workflow-owner').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16),true);
    if(process.env.NEXO_QA_DIR)await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,`fase4-dialogo-${width}-${theme}.png`)});
    await page.locator('#workflow-cancel').click();
   }
  }
  assert.deepEqual(page.appErrors,[]);
 }finally{await context.close();}
});
test('200 percent text reflows form tabs and actions without global overflow at 320px',async()=>{
 const {page,context}=await fixture();try{
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:1400});await page.locator('#nav-new').click();
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const clipped=await page.locator('#form-tabs [role=tab],.form-step-controls button,.form-footer button').evaluateAll(els=>els.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));assert.deepEqual(clipped,[]);
  await page.locator('#btnNextStep').click();await page.waitForFunction(()=>location.hash==='#cadastro/etapa-2');
  assert.equal(await page.locator('#form-step-status').textContent(),'Etapa 2 de 8 — Situação');
 }finally{await context.close();}
});
