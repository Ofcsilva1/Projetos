const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {fixture,guard,records,tab,storageKey,neutralFields} = require('./helpers/browser-fixture.cjs');

test('neutral new case persists across reload and saved records do not trigger exit warnings',async()=>{
  const {page,context}=await fixture();
  try {
    assert.equal(await page.locator('#summary-total').textContent(),'12');
    await page.locator('#nav-new').click();
    for(const id of neutralFields)assert.equal(await page.locator('#'+id).inputValue(),'');
    assert.equal(await guard(page),false);
    await page.locator('#numero-prontuario').fill('NEXO-FASE1');await page.locator('#data-entrada').fill('2026-10-18');
    assert.equal(await guard(page),true);
    await page.locator('#btnSalvarCaso').click();
    await page.waitForFunction(()=>document.getElementById('summary-total').textContent==='13');
    assert.equal(await guard(page),false);
    const record=Object.values(await records(page)).find(r=>r.numeroProntuario==='NEXO-FASE1');
    assert.equal(Object.hasOwn(record,'situacaoAtual'),false);
    for(const key of ['origemCaso','cor','comunicacaoViolencia','retornoSolicitado','estudoCaso','piaElaborado'])assert.equal(record[key],'');
    await page.reload();await page.locator('#btnLogin').click();
    await page.waitForFunction(()=>document.getElementById('summary-total').textContent==='13');
    assert.ok(Object.values(await records(page)).some(r=>r.numeroProntuario==='NEXO-FASE1'));
    assert.equal(await guard(page),false);
  } finally {await context.close();}
});

test('existing imported selections, legacy fields and activities survive a case edit',async()=>{
  const original={numeroProntuario:'LEGADO-FICTICIO',dataEntrada:'2026-01-01',cor:'Valor importado',retornoSolicitado:'nao',estudoCaso:'sim',piaElaborado:'',comunicacaoViolencia:'nao',dadosPlanilha:'{"Origem":"Exemplo fictício"}',agenda_preservada:'Texto sintético preservado'};
  const {page,context}=await fixture({seed:{casos:{legado:original}}});
  try {
    await page.locator('.btnEditar').click();assert.equal(await guard(page),false);
    await page.locator('#detalhe-origem').fill('Detalhe fictício corrigido');await page.locator('#btnSalvarCaso').click();
    await page.waitForFunction(()=>document.getElementById('form-section').hidden);
    const saved=(await records(page)).legado;
    for(const [key,value] of Object.entries(original))assert.equal(saved[key],value);
    await page.locator('#nav-new').click();for(const id of neutralFields)assert.equal(await page.locator('#'+id).inputValue(),'');
  } finally {await context.close();}
});

test('inline errors reveal the correct tab, focus the field and clear after correction',async()=>{
  const {page,context}=await fixture();
  try {
    await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('   ');
    await tab(page,'tab3');await page.locator('#responsavel-nome').fill('Responsável fictício');
    await page.locator('#btnSalvarCaso').click();
    await page.waitForFunction(()=>document.activeElement.id==='numero-prontuario');
    assert.match(await page.locator('#numero-prontuario-error').textContent(),/Informe/);
    assert.match(await page.locator('#numero-prontuario').getAttribute('aria-describedby'),/numero-prontuario-error/);
    assert.equal(await page.locator('#responsavel-nome').inputValue(),'Responsável fictício');
    await page.locator('#numero-prontuario').fill('1');await page.locator('#data-entrada').fill('2026-10-18');await page.locator('#btnSalvarCaso').click();
    await page.waitForFunction(()=>document.getElementById('numero-prontuario-error').textContent.includes('já está cadastrado'));
    assert.equal(Object.keys(await records(page)).length,12);
    await page.locator('#numero-prontuario').fill('NOVO');assert.equal(await page.locator('#numero-prontuario').getAttribute('aria-invalid'),null);
    await page.locator('#numero-prontuario').evaluate(el=>{el.value='X'.repeat(101);});await page.locator('#btnSalvarCaso').click();
    assert.match(await page.locator('#numero-prontuario-error').textContent(),/100/);
  } finally {await context.close();}
});

test('cancel, logout and accepted/canceled reload protect only unsaved case input',async()=>{
  const {page,context}=await fixture();
  try {
    await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('RASCUNHO');
    page.once('dialog',dialog=>dialog.dismiss());await page.locator('#btnCancelarForm').click();
    assert.equal(await page.locator('#form-section').isVisible(),true);
    const shown=page.waitForEvent('dialog');const reload=page.reload().catch(()=>{});
    const dialog=await shown;assert.equal(dialog.type(),'beforeunload');await dialog.dismiss();await reload;
    assert.equal(await page.locator('#numero-prontuario').inputValue(),'RASCUNHO');
    page.once('dialog',dialog=>dialog.dismiss());await page.locator('#btnDemoLogout').click();assert.equal(await page.locator('#app-wrapper').isVisible(),true);
    page.once('dialog',dialog=>dialog.accept());await page.locator('#btnDemoLogout').click();assert.equal(await page.locator('#auth-wrapper').isVisible(),true);
    assert.equal(await guard(page),false);
    await page.locator('#btnLogin').click();await page.locator('#nav-new').click();assert.equal(await page.locator('#numero-prontuario').inputValue(),'');
    await page.locator('#numero-prontuario').fill('DESCARTAR');
    const accept=page.waitForEvent('dialog');const accepted=page.reload();await (await accept).accept();await accepted;
    await page.locator('#btnLogin').click();assert.equal(Object.keys(await records(page)).length,12);
  } finally {await context.close();}
});

test('quota failure retains the prior saved dataset and the editable draft',async()=>{
  const {page,context}=await fixture();
  try {
    const previous=await records(page);await page.locator('#nav-new').click();
    await page.locator('#numero-prontuario').fill('QUOTA-FICTICIA');await page.locator('#data-entrada').fill('2026-10-18');
    await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Synthetic quota','QuotaExceededError');};});
    await page.locator('#btnSalvarCaso').click();
    await page.waitForFunction(()=>document.getElementById('case-save-status').textContent.includes('Sem espaço'));
    assert.deepEqual(await records(page),previous);assert.equal(await page.locator('#numero-prontuario').inputValue(),'QUOTA-FICTICIA');
    assert.equal(await page.locator('#btnSalvarCaso').isEnabled(),true);assert.equal(await guard(page),true);
  } finally {await context.close();}
});

test('workflow validation, cancel and saved appointments preserve local persistence',async()=>{
  const {page,context}=await fixture();
  try {
    await page.locator('#nav-agenda').click();await page.locator('#agenda-new').click();assert.equal(await guard(page),false);
    await page.locator('#workflow-case').selectOption('exemplo-1');await page.locator('#workflow-owner').fill('   ');await page.locator('#workflow-save').click();
    assert.equal(await page.locator('#workflow-owner').getAttribute('aria-invalid'),'true');
    await page.locator('#workflow-owner').fill('Equipe fictícia');await page.locator('#workflow-date').fill('2026-10-18');
    await page.locator('#workflow-status').selectOption('realizado');await page.locator('#workflow-save').click();
    assert.equal(await page.locator('#workflow-completed').getAttribute('aria-invalid'),'true');
    await page.locator('#workflow-completed').fill('2026-10-18');await page.locator('#workflow-save').click();
    await page.waitForFunction(()=>!document.getElementById('workflow-dialog').open);assert.equal(await guard(page),false);
    assert.equal(await page.locator('#agenda-rows tr').count(),1);
    await page.reload();await page.locator('#btnLogin').click();await page.locator('#nav-agenda').click();assert.equal(await page.locator('#agenda-rows tr').count(),1);
    await page.locator('#nav-tasks').click();await page.locator('#tarefas-new').click();await page.locator('#workflow-description').fill('Pendência fictícia');
    assert.equal(await guard(page),true);
    page.once('dialog',dialog=>dialog.dismiss());await page.locator('#workflow-cancel').click();assert.equal(await page.locator('#workflow-dialog').isVisible(),true);
    page.once('dialog',dialog=>dialog.accept());await page.locator('#workflow-cancel').click();assert.equal(await guard(page),false);
  } finally {await context.close();}
});

test('explicit demo reset discards drafts with one confirmation and restores only fictional examples',async()=>{
  const {page,context}=await fixture();
  try {
    await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('DESCARTAR');
    let dialogs=0;page.on('dialog',dialog=>{dialogs++;dialog.accept();});
    await page.locator('#btnResetDemo').click();await page.waitForFunction(()=>document.documentElement.dataset.demoReady==='true'&&!document.getElementById('auth-wrapper').hidden);
    assert.equal(dialogs,1);await page.locator('#btnLogin').click();assert.equal(Object.keys(await records(page)).length,12);assert.equal(await guard(page),false);
  } finally {await context.close();}
});

test('storage fallback is explicit and the save-start guard prevents duplicate submissions',async()=>{
  const {page,context}=await fixture({blocked:true});
  try {
    assert.match(await page.locator('#demo-storage-status').textContent(),/apenas até recarregar/);
    await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('MEMORIA');await page.locator('#data-entrada').fill('2026-10-18');
    const protectedDuringSave=await page.evaluate(()=>{
      const form=document.getElementById('case-form');form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
      const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);
      form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));return event.defaultPrevented;
    });
    assert.equal(protectedDuringSave,true);await page.waitForFunction(()=>document.getElementById('summary-total').textContent==='13');assert.equal(await guard(page),false);
  } finally {await context.close();}
});

test('NEXO identity, eight real tabs and inline errors fit desktop and mobile in both themes',async()=>{
  const {page,context}=await fixture();
  try {
    assert.match(await page.title(),/Nexo/i);
    assert.equal(await page.locator('.sidebar img').getAttribute('src'),'marca.svg?v=20261016.demo2');
    await page.locator('#nav-new').click();await page.locator('#numero-prontuario').fill('FICTICIO-UI');
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});
      for(const theme of ['light','dark']) {
        await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.bsTheme=theme;},theme);
        for(let i=1;i<=8;i++)await tab(page,'tab'+i);
        assert.equal(await page.locator('#numero-prontuario').inputValue(),'FICTICIO-UI');await page.locator('#btnSalvarCaso').click();
        await page.waitForFunction(()=>document.getElementById('tab1').classList.contains('show')&&getComputedStyle(document.getElementById('tab1')).opacity==='1');
        const active=await page.locator('[data-bs-target="#tab1"]').boundingBox();assert.ok(active.x>=0&&active.x+active.width<=width);
        const error=await page.locator('#data-entrada-error').boundingBox();assert.ok(error.x>=0&&error.x+error.width<=width);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await page.evaluate(()=>document.querySelectorAll('.notification').forEach(n=>n.remove()));
        if(process.env.NEXO_QA_DIR)await page.screenshot({path:path.join(process.env.NEXO_QA_DIR,`nexo-${width}-${theme}.png`),fullPage:true});
      }
    }
    assert.deepEqual(page.appErrors,[]);assert.ok(page.external.every(url=>!(/firebase|googleapis.com\/identity/i.test(url))));
  } finally {await context.close();}
});
