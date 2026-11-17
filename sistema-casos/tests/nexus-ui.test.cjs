// Fluxo do assistente: verifica navegação, consulta real da base, teclado e largura móvel.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { fixture, records, storageKey } = require('./helpers/browser-fixture.cjs');

test('chat queries the actual dataset, escapes messages, preserves drafts and fits both themes', async () => {
  const { page, context } = await fixture({ seed: { casos: {
    exemplo: { numeroProntuario: '1', nomeCriad: 'Pessoa fictícia', dataEntrada: '2026-11-01' }
  } } });
  try {
    await page.getByRole('link', { name: 'Pergunte ao Nexus' }).click();
    assert.match(page.url(), /#nexus$/);
    assert.equal(await page.getByRole('heading', { name: 'Pergunte ao Nexus', exact: true }).isVisible(), true);
    const input = page.getByRole('textbox', { name: 'Sua pergunta sobre o serviço' });
    await input.fill('Quantos prontuários tiveram entrada de 01/11/2026 até 16/11/2026?');
    await input.press('Enter');
    assert.match(await page.locator('.nexus-message-assistant').last().textContent(), /entrada no serviço: 1/);
    assert.equal(await input.inputValue(), '');
    assert.equal(await input.evaluate(node => node === document.activeElement), true);
    await input.fill('<img src=x onerror="window.injetado=true">');
    await page.getByRole('button', { name: 'Consultar dados', exact: true }).click();
    assert.equal(await page.locator('#nexus-messages img').count(), 0);
    assert.equal(await page.evaluate(() => window.injetado), undefined);
    await page.getByRole('button', { name: 'Limpar conversa' }).click();
    assert.equal(await page.locator('#nexus-messages article').count(), 0);
    assert.equal(Object.keys(await records(page)).length, 1);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        const bounds = await input.boundingBox();
        assert.ok(bounds.width > 0 && bounds.x >= 0 && bounds.x + bounds.width <= width);
        if (process.env.NEXO_QA_DIR && width !== 320) await page.screenshot({ path: path.join(process.env.NEXO_QA_DIR, `nexus-${width}-${theme}.png`), fullPage: true });
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#nav-new').click();
    await page.locator('#numero-prontuario').fill('RASCUNHO');
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#nav-nexus').click();
    assert.equal(await page.locator('#form-section').isVisible(), true);
    assert.equal(await page.locator('#numero-prontuario').inputValue(), 'RASCUNHO');
    assert.deepEqual(page.appErrors, []);
  } finally { await context.close(); }
});

// Continuidade: fechar uma aba não pode apagar a planilha do laboratório.
test('laboratory records survive closing a tab and updates synchronize between tabs', async () => {
  const { page, context } = await fixture({ seed: { casos: { inicial: { numeroProntuario: '1', dataEntrada: '2026-11-01' } } } });
  try {
    await page.evaluate(async () => {
      const store = await import('./local-store.js?v=20261116.lab1');
      await store.runTransaction('casos/persistido', () => ({ numeroProntuario: '2', dataEntrada: '2026-11-02' }));
    });
    await page.close();
    const reopened = await context.newPage();
    await reopened.goto('https://nexo.test/sistema-casos/#nexus');
    await reopened.waitForFunction(() => document.documentElement.dataset.demoReady === 'true');
    assert.equal(Object.keys(await records(reopened)).length, 2);
    await reopened.locator('#btnLogin').click();
    assert.equal(await reopened.locator('#nexus-section').isVisible(), true);
    const second = await context.newPage();
    await second.goto('https://nexo.test/sistema-casos/');
    await second.waitForFunction(() => document.documentElement.dataset.demoReady === 'true');
    await Promise.all([reopened, second].map((tab, index) => tab.evaluate(async index => {
      const store = await import('./local-store.js?v=20261116.lab1');
      await store.runTransaction(`casos/concorrente-${index}`, () => ({ numeroProntuario: String(3 + index), dataEntrada: '2026-11-03' }));
    }, index)));
    await reopened.waitForFunction(key => Object.keys(JSON.parse(localStorage.getItem(key)).casos).length === 4, storageKey);
    await second.locator('#btnLogin').click();
    await second.waitForFunction(() => document.getElementById('summary-total').textContent === '4');
    await reopened.getByRole('textbox', { name: 'Sua pergunta sobre o serviço' }).fill('Quantos prontuários tiveram entrada de 01/11/2026 até 16/11/2026?');
    await reopened.getByRole('button', { name: 'Consultar dados', exact: true }).click();
    assert.match(await reopened.locator('.nexus-message-assistant').last().textContent(), /entrada no serviço: 4/);
  } finally { await context.close(); }
});
