const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture,guard,records,tab}=require('./helpers/browser-fixture.cjs');
const waitRoute=(page,hash)=>page.waitForFunction(hash=>location.hash===hash,hash);

test('section links, Back and Forward restore URL, section and focus without record identifiers',async()=>{
 const {page,context}=await fixture();try{
  await waitRoute(page,'#casos');
  await page.locator('#nav-agenda').click();await waitRoute(page,'#agenda');
  await page.locator('#nav-tasks').click();await waitRoute(page,'#pendencias');
  await page.goBack();await page.waitForFunction(()=>!document.getElementById('agenda-section').hidden);
  assert.equal(new URL(page.url()).hash,'#agenda');assert.equal(await page.evaluate(()=>document.activeElement.id),'page-title');
  await page.goForward();await page.waitForFunction(()=>!document.getElementById('tasks-section').hidden);
  await page.locator('#nav-list').click();await page.locator('.btnEditar').first().click();
  assert.equal(new URL(page.url()).hash,'#cadastro/etapa-1');
  assert.deepEqual(await page.evaluate(()=>Object.keys(history.state).sort()),['index','nexoNavigation']);
  assert.deepEqual(page.appErrors,[]);
 }finally{await context.close();}
});
test('Back cancellation restores the URL and draft; acceptance and Forward keep history usable',async()=>{
 const {page,context}=await fixture();try{
  await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('RASCUNHO-SINTETICO');
  page.once('dialog',d=>d.dismiss());await page.goBack();
  await waitRoute(page,'#cadastro/etapa-1');
  assert.equal(await page.locator('#numero-prontuario').inputValue(),'RASCUNHO-SINTETICO');assert.equal(await guard(page),true);
  page.once('dialog',d=>d.accept());await page.goBack();await page.waitForFunction(()=>!document.getElementById('list-section').hidden);
  assert.equal(new URL(page.url()).hash,'#casos');assert.equal(await guard(page),false);
  await page.goForward();await page.waitForFunction(()=>!document.getElementById('form-section').hidden);
  assert.equal(new URL(page.url()).hash,'#cadastro/etapa-1');
  assert.equal(await page.locator('#numero-prontuario').inputValue(),'');assert.equal(await guard(page),false);
 }finally{await context.close();}
});
test('direct section and step links work after entry; unknown routes and queries are normalized',async()=>{
 for(const [hash,section,expected] of [['#agenda','agenda-section','#agenda'],['#cadastro/etapa-6','form-section','#cadastro/etapa-6'],['?nome=FICTICIO#invalido','list-section','#casos']]){
  const {page,context}=await fixture({hash});try{
   assert.equal(await page.locator('#'+section).isVisible(),true);assert.equal(new URL(page.url()).hash,expected);
   assert.equal(new URL(page.url()).search,'');
   if(section==='form-section')assert.equal(await page.locator('#form-step-status').textContent(),'Etapa 6 de 8 — Retorno');
   await page.reload();await page.locator('#btnLogin').click();assert.equal(await page.locator('#'+section).isVisible(),true);
  }finally{await context.close();}
 }
});
test('manually changing a fragment and using skip content cannot bypass draft protection',async()=>{
 const {page,context}=await fixture();try{
  await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('RASCUNHO-URL');
  page.once('dialog',d=>d.dismiss());await page.evaluate(()=>{location.hash='agenda';});
  await waitRoute(page,'#cadastro/etapa-1');assert.equal(await page.locator('#numero-prontuario').inputValue(),'RASCUNHO-URL');
  await page.locator('#skip-to-content').evaluate(el=>el.click());
  assert.equal(new URL(page.url()).hash,'#cadastro/etapa-1');assert.equal(await page.locator('#form-section').isVisible(),true);
 }finally{await context.close();}
});
test('step controls, direct tabs and arrows preserve form values and reveal validation errors',async()=>{
 const {page,context}=await fixture();try{
  await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('ETAPAS-FICTICIAS');
  assert.equal(await page.locator('#btnPreviousStep').isDisabled(),true);
  for(let n=2;n<=8;n++) {await page.locator('#btnNextStep').click();await page.waitForFunction(n=>document.querySelector('#form-step-status').textContent.startsWith(`Etapa ${n} de 8`),n);}
  assert.equal(await page.locator('#btnNextStep').isDisabled(),true);assert.equal(new URL(page.url()).hash,'#cadastro/etapa-8');
  await page.locator('#btnPreviousStep').click();await tab(page,'tab3');await page.locator('#responsavel-nome').fill('Pessoa fictícia');
  await page.locator('#form-tab-3').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('#form-tab-4').getAttribute('aria-selected')==='true');
  await tab(page,'tab1');assert.equal(await page.locator('#numero-prontuario').inputValue(),'ETAPAS-FICTICIAS');
  await page.locator('#numero-prontuario').fill('   ');await tab(page,'tab8');await page.locator('#btnSalvarCaso').click();
  await page.waitForFunction(()=>document.activeElement.id==='numero-prontuario');
  assert.equal(await page.locator('#responsavel-nome').inputValue(),'Pessoa fictícia');
  assert.equal(new URL(page.url()).hash,'#cadastro/etapa-1');assert.equal(Object.keys(await records(page)).length,12);
 }finally{await context.close();}
});
test('confirmed save offers edit and attendance for the same saved case, with no duplicate',async()=>{
 const {page,context}=await fixture();try{
  await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('CONTINUIDADE-FICTICIA');await page.locator('#data-entrada').fill('2026-10-18');
  await page.locator('#btnSalvarCaso').click();await page.locator('#case-saved-actions').waitFor({state:'visible'});
  assert.equal(await guard(page),false);assert.equal(Object.keys(await records(page)).length,13);
  await page.locator('#btnContinueCase').click();assert.equal(await page.locator('#numero-prontuario').inputValue(),'CONTINUIDADE-FICTICIA');assert.equal(await page.locator('#numero-prontuario').getAttribute('readonly'),'');
  await page.locator('#detalhe-origem').fill('Atualização fictícia');await page.locator('#btnSalvarCaso').click();await page.locator('#case-saved-actions').waitFor({state:'visible'});
  assert.equal(Object.keys(await records(page)).length,13);
  await page.locator('#btnSavedAttendance').click();await page.locator('#workflow-dialog').waitFor({state:'visible'});
  assert.match(await page.locator('#workflow-case option:checked').textContent(),/CONTINUIDADE-FICTICIA/);
  await page.locator('#workflow-owner').fill('Técnico fictício');await page.locator('#workflow-date').fill('2026-10-19');await page.locator('#workflow-save').click();await page.locator('#workflow-dialog').waitFor({state:'hidden'});
  const saved=Object.values(await records(page)).find(r=>r.numeroProntuario==='CONTINUIDADE-FICTICIA');assert.ok(Object.keys(saved).some(k=>k.startsWith('agenda_')));
  assert.equal(await guard(page),false);assert.deepEqual(page.appErrors,[]);
 }finally{await context.close();}
});
test('Back protects an unsaved attendance modal and closes it only after confirmation',async()=>{
 const {page,context}=await fixture();try{
  await page.locator('#nav-agenda').click();await page.locator('#agenda-new').click();await page.locator('#workflow-owner').fill('Rascunho fictício');
  page.once('dialog',d=>d.dismiss());await page.goBack();await waitRoute(page,'#agenda');assert.equal(await page.locator('#workflow-dialog').isVisible(),true);
  assert.equal(await page.locator('#workflow-owner').inputValue(),'Rascunho fictício');
  page.once('dialog',d=>d.accept());await page.goBack();await page.waitForFunction(()=>!document.getElementById('list-section').hidden);
  assert.equal(await page.locator('#workflow-dialog').isVisible(),false);assert.equal(await guard(page),false);
 }finally{await context.close();}
});
test('mobile cards retain all seven case fields and six workflow fields, actions and details in both themes',async()=>{
 const {page,context}=await fixture();try{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   for(const theme of ['light','dark']){
    if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.locator('.sidebar-footer [data-theme-toggle]').click();
    await page.locator('#nav-list').click();
    const row=page.locator('#case-table tbody tr').first();assert.equal(await row.locator('td').count(),7);
    if(width<768){assert.equal(await row.locator('.mobile-cell-label:visible').count(),7);assert.equal(await row.evaluate(el=>el.getBoundingClientRect().right<=innerWidth),true);}
    await row.locator('.btnDetalhes').click();assert.equal(await page.locator('.details-row').isVisible(),true);await row.locator('.btnDetalhes').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    if(process.env.NEXO_QA_DIR){await row.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,`fase3-casos-${width}-${theme}.png`)});}
    await page.locator('#nav-new').click();
    assert.equal(await page.locator('#form-tabs [role=tab]:visible').count(),8);
    if(width<768){const bounds=await page.locator('#form-tabs [role=tab]').evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect();return b.right<=innerWidth&&b.left>=0&&b.height>=44;}));assert.ok(bounds.every(Boolean));}
    if(process.env.NEXO_QA_DIR){await page.locator('#form-tabs').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,`fase3-abas-${width}-${theme}.png`)});}
   }
  }
  await page.setViewportSize({width:320,height:1000});await page.locator('#nav-agenda').click();await page.locator('#agenda-new').click();
  await page.locator('#workflow-case').selectOption({index:1});await page.locator('#workflow-owner').fill('Responsável fictício');await page.locator('#workflow-date').fill('2026-10-19');await page.locator('#workflow-save').click();await page.locator('#workflow-dialog').waitFor({state:'hidden'});
  const row=page.locator('#agenda-rows tr').first();assert.equal(await row.locator('td').count(),6);assert.equal(await row.locator('.mobile-cell-label:visible').count(),6);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await row.locator('button').last().isVisible(),true);
  if(process.env.NEXO_QA_DIR){await row.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,'fase3-agenda-320-dark.png')});}
  await page.locator('#nav-tasks').click();await page.locator('#tarefas-new').click();
  await page.locator('#workflow-case').selectOption({index:1});await page.locator('#workflow-owner').fill('Responsável fictício');
  const description='Pendência fictícia com descrição extensa para verificar a leitura completa no celular e o acesso às ações.';
  await page.locator('#workflow-description').fill(description);await page.locator('#workflow-save').click();await page.locator('#workflow-dialog').waitFor({state:'hidden'});
  const task=page.locator('#tarefas-rows tr').first();assert.equal(await task.locator('td').count(),6);assert.equal(await task.locator('.mobile-cell-label:visible').count(),6);
  assert.match(await task.textContent(),/Pendência fictícia com descrição extensa/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await task.locator('button').last().click();await page.locator('#workflow-dialog').waitFor({state:'visible'});assert.equal(await page.locator('#workflow-description').inputValue(),description);await page.locator('#workflow-cancel').click();
  if(process.env.NEXO_QA_DIR){await task.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,'fase3-pendencias-320-dark.png')});}
  assert.deepEqual(page.appErrors,[]);
 }finally{await context.close();}
});
