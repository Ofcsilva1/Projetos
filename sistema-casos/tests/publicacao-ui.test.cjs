// Demonstração pública: garante consultas sem servidor e sem requisições à API de IA.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fixture, records } = require('./helpers/browser-fixture.cjs');

test('static portfolio version answers locally and never requests the Gemini backend', async () => {
  const { page, context } = await fixture();
  try {
    const requests = [];
    page.on('request', request => requests.push(new URL(request.url()).pathname));
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.demoReady === 'true');
    await page.locator('#btnLogin').click();
    const before = await records(page);
    await page.locator('#nav-nexus').click();
    assert.equal(await page.locator('#nexus-mode option[value="gemini"]').isDisabled(), true);
    await page.getByRole('textbox', { name: 'Sua pergunta sobre o serviço' }).fill('Quantos prontuários tiveram entrada de 01/01/2026 até 31/12/2026?');
    await page.getByRole('button', { name: 'Consultar dados', exact: true }).click();
    assert.match(await page.locator('.nexus-message-assistant').last().textContent(), /entrada no serviço: 12/);
    assert.equal(requests.some(request => request.startsWith('/api/')), false);
    assert.deepEqual(await records(page), before);
    assert.deepEqual(page.appErrors, []);
  } finally {
    await context.close();
  }
});

// Servidor configurado: permite testar a integração sem enviar perguntas ou chaves reais ao Google.
test('configured server runtime enables Gemini while keeping its key outside the browser', async () => {
  const { page, context } = await fixture();
  try {
    await context.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.dataset.nexusRuntime = 'server';
      }, { once: true });
    });
    await context.route('**/api/nexus/status', route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ configured: true, token: 'token-sintetico' })
    }));
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.demoReady === 'true');
    await page.locator('#btnLogin').click();
    await page.locator('#nav-nexus').click();
    await page.waitForFunction(() => document.querySelector('#nexus-mode').value === 'gemini');
    assert.equal(await page.locator('#nexus-mode option[value="gemini"]').isDisabled(), false);
    assert.equal(await page.locator('#nexus-mode-label').textContent(), 'Gemini · interpretação com IA');
    assert.deepEqual(page.appErrors, []);
  } finally {
    await context.close();
  }
});
