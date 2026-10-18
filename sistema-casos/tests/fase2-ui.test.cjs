const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {fixture,tab} = require('./helpers/browser-fixture.cjs');

test('keyboard skip links target the visible login or main content',async()=>{
  const {page,context}=await fixture({noLogin:true});
  try {
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#skip-to-login').evaluate(el=>el===document.activeElement),true);
    const link=await page.locator('#skip-to-login').boundingBox();assert.ok(link.y>=0);
    await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'login-section');
    await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'username');
    assert.equal(await page.locator('h1:visible').count(),1);
    await page.locator('#btnLogin').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'page-title');
    for(let i=0;i<15&&await page.evaluate(()=>document.activeElement.id)!=='skip-to-content';i++)await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'skip-to-content');
    await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content');
    await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'filtroBusca');
    assert.equal(await page.locator('h1:visible').count(),1);
    assert.equal(await page.locator('#skip-to-login').isVisible(),false);
  } finally {await context.close();}
});

test('all case fields have associated labels and names, and CPF keeps text with numeric input mode',async()=>{
  const {page,context}=await fixture();
  try {
    await page.locator('#nav-new').click();
    const missing=await page.locator('#case-form').evaluate(form=>[...form.querySelectorAll('input,select,textarea')].filter(el=>el.type!=='hidden').filter(el=>!el.name||!(el.labels?.length||el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'))).map(el=>el.id));
    assert.deepEqual(missing,[]);
    await page.getByText('Número do Prontuário',{exact:false}).filter({has:page.locator('span.text-danger')}).first().click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'numero-prontuario');
    await tab(page,'tab3');
    await page.locator('label[for="responsavel-cpf"]').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'responsavel-cpf');
    const cpf=page.getByLabel('CPF do(a) Responsável');
    assert.equal(await cpf.getAttribute('type'),'text');assert.equal(await cpf.getAttribute('inputmode'),'numeric');
    await cpf.fill('001.002.003-00');assert.equal(await cpf.inputValue(),'001.002.003-00');
    await tab(page,'tab4');
    const checkbox=page.locator('.violence-choices input').first();
    await checkbox.locator('..').click();assert.equal(await checkbox.isChecked(),true);
  } finally {await context.close();}
});

test('navigation and editing move focus predictably and mark the current section',async()=>{
  const {page,context}=await fixture();
  try {
    assert.equal(await page.getByRole('navigation',{name:'Navegação principal'}).count(),1);
    for(const id of ['nav-agenda','nav-tasks','nav-list']) {
      await page.locator('#'+id).click();
      assert.equal(await page.evaluate(()=>document.activeElement.id),'page-title');
      assert.equal(await page.locator('#'+id).getAttribute('aria-current'),'page');
      assert.equal(await page.locator('.sidebar-menu [aria-current="page"]').count(),1);
    }
    await page.locator('.btnEditar').first().click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'page-title');
    assert.match(await page.locator('#page-title').textContent(),/Editar/);
    await page.locator('#btnCancelarForm').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'page-title');
    await page.locator('#nav-new').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'numero-prontuario');
    await page.locator('#btnDemoLogout').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'login-title');
  } finally {await context.close();}
});

test('export and detail actions expose names and expansion state',async()=>{
  const {page,context}=await fixture();
  try {
    for(const name of ['Exportar CSV','Exportar Excel','Exportar PDF'])assert.equal(await page.getByRole('button',{name,exact:true}).count(),1);
    const details=page.locator('.btnDetalhes').first();
    assert.match(await details.getAttribute('aria-label'),/prontuário/);
    assert.equal(await details.getAttribute('aria-expanded'),'false');
    const id=await details.getAttribute('aria-controls');await details.click();
    assert.equal(await details.getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('#'+id).isVisible(),true);
    await details.click();assert.equal(await details.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#'+id).count(),0);
  } finally {await context.close();}
});

test('form tabs have linked tab panels and support keyboard arrow navigation',async()=>{
  const {page,context}=await fixture();
  try {
    await page.locator('#nav-new').click();
    await page.locator('#form-tab-1').focus();await page.keyboard.press('ArrowRight');
    await page.waitForFunction(()=>document.getElementById('form-tab-2').getAttribute('aria-selected')==='true');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'form-tab-2');
    const invalid=await page.locator('#form-tabs [role="tab"]').evaluateAll(tabs=>tabs.filter(tab=>{const panel=document.getElementById(tab.getAttribute('aria-controls'));return !panel||panel.getAttribute('role')!=='tabpanel'||panel.getAttribute('aria-labelledby')!==tab.id;}).map(tab=>tab.id));
    assert.deepEqual(invalid,[]);assert.equal(await page.locator('#form-tabs [aria-selected="true"]').count(),1);
  } finally {await context.close();}
});

test('workflow fields have names and the dialog prevents background focus and returns on Escape',async()=>{
  const {page,context}=await fixture();
  try {
    await page.locator('#nav-agenda').click();await page.locator('#agenda-new').click();
    const dialog=page.getByRole('dialog',{name:'Adicionar atendimento'});assert.equal(await dialog.isVisible(),true);
    const missing=await dialog.evaluate(dialog=>[...dialog.querySelectorAll('input,select,textarea')].filter(el=>!el.name||!(el.labels?.length||el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'))).map(el=>el.id));assert.deepEqual(missing,[]);
    for(let i=0;i<20;i++) {
      await page.keyboard.press('Tab');
      const focus=await dialog.evaluate(el=>({inside:el.contains(document.activeElement),browserBoundary:document.activeElement===document.body}));
      assert.ok(focus.inside||focus.browserBoundary,'A background control received modal focus.');
      // A native browser tab cycle can report body at its boundary; require re-entry.
      if (focus.browserBoundary) {
        await page.keyboard.press('Tab');
        assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true);
      }
    }
    await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'agenda-new');
  } finally {await context.close();}
});

test('mobile header has no overlapping or hidden controls at 320, 360, 390 and 768px in both themes',async()=>{
  const {page,context}=await fixture();
  try {
    await page.emulateMedia({reducedMotion:'reduce'});
    for(const width of [320,360,390,768]) {
      await page.setViewportSize({width,height:1000});
      for(const theme of ['light','dark']) {
        if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.locator('.sidebar-footer [data-theme-toggle]').click();
        await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
        const result=await page.locator('.sidebar').evaluate(sidebar=>{
          const logo=sidebar.querySelector('.demo-logo');const menu=sidebar.querySelector('.sidebar-menu-container');const footer=sidebar.querySelector('.sidebar-footer');
          const rect=el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};
          const overlaps=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5;
          const parts=[logo,menu,footer].map(rect);
          const controls=[...sidebar.querySelectorAll('.sidebar-footer > .btn,.sidebar-menu a')];
          return {partsOverlap:parts.some((a,i)=>parts.slice(i+1).some(b=>overlaps(a,b))),logo:rect(logo),controls:controls.map(el=>{const b=rect(el);const hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);return {...b,name:el.textContent.trim(),hit:!!hit&&el.contains(hit),clipped:el.scrollWidth>el.clientWidth+1};}),overflow:document.documentElement.scrollWidth>innerWidth};
        });
        assert.equal(result.partsOverlap,false,`${width}/${theme}: logo, menu and actions overlap`);
        assert.ok(result.logo.left>=0&&result.logo.right<=width);
        for(const control of result.controls) {
          assert.ok(control.width>=44&&control.height>=44,`${width}/${theme}: small target ${control.name}`);
          assert.equal(control.hit,true,`${width}/${theme}: covered target ${control.name}`);
          assert.equal(control.clipped,false,`${width}/${theme}: clipped text ${control.name}`);
        }
        assert.equal(result.overflow,false);
        if(process.env.NEXO_QA_DIR)await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,`fase2-${width}-${theme}.png`),fullPage:false});
      }
    }
    assert.deepEqual(page.appErrors,[]);
  } finally {await context.close();}
});

test('mobile header reflows at 200 percent text size without overlap',async()=>{
  const {page,context}=await fixture();
  try {
    await page.setViewportSize({width:320,height:1400});await page.evaluate(()=>{document.documentElement.style.fontSize='200%';window.scrollTo(0,0);});
    const bounds=await page.locator('.sidebar-header,.sidebar-menu-container,.sidebar-footer').evaluateAll(elements=>elements.map(el=>{const b=el.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right};}));
    assert.ok(bounds[0].bottom<=bounds[1].top&&bounds[1].bottom<=bounds[2].top);
    assert.ok(bounds.every(b=>b.left>=0&&b.right<=320));
    const clipped=await page.locator('.sidebar-footer >.btn').evaluateAll(elements=>elements.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent.trim()));assert.deepEqual(clipped,[]);
  } finally {await context.close();}
});

test('keyboard focus contrast exceeds 3 to 1 in light and dark themes',async()=>{
  const {page,context}=await fixture();
  const luminance=rgb=>{const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  try {
    await page.setViewportSize({width:390,height:1000});
    for(const theme of ['light','dark']) {
      if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.locator('.sidebar-footer [data-theme-toggle]').click();
      await page.locator('.sidebar-footer [data-theme-toggle]').focus();await page.keyboard.press('Tab');
      const styles=await page.evaluate(()=>{const el=document.activeElement,s=getComputedStyle(el);return {id:el.id,width:parseFloat(s.outlineWidth),style:s.outlineStyle,focus:s.outlineColor,background:getComputedStyle(document.querySelector('.sidebar')).backgroundColor};});
      assert.equal(styles.id,'btnDemoLogout');assert.ok(styles.width>=3);assert.equal(styles.style,'solid');
      const a=luminance(styles.focus),b=luminance(styles.background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=3,`${theme}: focus contrast ${ratio}`);
    }
  } finally {await context.close();}
});

test('desktop sidebar can scroll to focused actions on short viewports',async()=>{
  const {page,context}=await fixture();
  try {
    await page.setViewportSize({width:1440,height:550});
    const link=page.locator('.sidebar-footer a');await link.focus();
    const b=await link.boundingBox();assert.ok(b.y>=0&&b.y+b.height<=550);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  } finally {await context.close();}
});
