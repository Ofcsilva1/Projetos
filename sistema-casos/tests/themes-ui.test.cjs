// Temas compartilhados: verifica telas reais sem chamar IA nem acessar dados do usuário.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { fixture } = require('./helpers/browser-fixture.cjs');

function contrast(first, second) {
  const luminance = color => {
    const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

// Navegação e contraste: confirma que as cinco páginas usam a mesma linguagem visual.
test('shared themes cover all five pages on desktop, tablet and narrow mobile', async () => {
  const { page, context } = await fixture();
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const originalLogo = await page.locator('.sidebar .demo-logo').getAttribute('src');
    for (const theme of ['light', 'dark']) {
      if (await page.evaluate(() => document.documentElement.dataset.theme) !== theme) {
        await page.locator('.sidebar-footer [data-theme-toggle]').click();
      }
      for (const width of [1440, 768, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const id of ['nav-list', 'nav-new', 'nav-agenda', 'nav-tasks', 'nav-nexus']) {
          await page.locator(`#${id}`).click();
          // Aguarda as transições reais do item ativo; contar quadros não garante cores finais no CI.
          await page.locator(`#${id}.active`).evaluate(async element => {
            await Promise.all(element.getAnimations().map(animation => animation.finished));
          });
          const styles = await page.evaluate(() => {
            const body = getComputedStyle(document.body);
            const nav = getComputedStyle(document.querySelector('.sidebar-menu a.active'));
            const panel = [...document.querySelectorAll('.card-panel,.nexus-chat')]
              .find(element => element.getBoundingClientRect().height > 0);
            const card = getComputedStyle(panel);
            return {
              overflow: document.documentElement.scrollWidth > innerWidth,
              canvas: body.backgroundColor,
              panel: card.backgroundColor,
              text: [card.color, card.backgroundColor],
              navigation: [nav.color, nav.backgroundColor]
            };
          });
          const label = `${theme}/${width}/${id}`;
          assert.equal(styles.overflow, false, `${label}: horizontal overflow`);
          assert.notEqual(styles.canvas, styles.panel, `${label}: missing surface hierarchy`);
          assert.ok(contrast(...styles.text) >= 4.5, `${label}: panel contrast`);
          assert.ok(contrast(...styles.navigation) >= 4.5, `${label}: selected navigation contrast ${JSON.stringify(styles.navigation)}`);
          assert.equal(await page.locator('.sidebar .demo-logo').getAttribute('src'), originalLogo);
          if (process.env.NEXO_QA_DIR) {
            // No celular, registra o conteúdo; o cabeçalho já é coberto pelos testes de navegação.
            if (width < 1000) {
              await page.evaluate(() => {
                const header = document.querySelector('.content-header');
                window.scrollTo(0, header.getBoundingClientRect().top + window.scrollY);
              });
            }
            await page.screenshot({ path: path.join(process.env.NEXO_QA_DIR, `themes-${id}-${width}-${theme}.png`) });
          }
        }
      }
    }
    assert.deepEqual(page.appErrors, []);
  } finally {
    await context.close();
  }
});

// Preferência e conversa: a troca de tema não apaga a conversa nem altera a consulta.
test('theme choice survives reload and chat bubbles retain readable contrast', async () => {
  const { page, context } = await fixture();
  try {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#nav-nexus').click();
    await page.getByRole('textbox', { name: 'Sua pergunta sobre o serviço' }).fill('Quantos prontuários temos?');
    await page.getByRole('button', { name: 'Consultar dados', exact: true }).click();
    await page.locator('.nexus-message-assistant').last().waitFor();
    const count = await page.locator('.nexus-message').count();
    for (const theme of ['dark', 'light']) {
      if (await page.evaluate(() => document.documentElement.dataset.theme) !== theme) {
        await page.locator('.sidebar-footer [data-theme-toggle]').click();
      }
      const bubbles = await page.locator('.nexus-message').evaluateAll(elements => elements.map(element => {
        const style = getComputedStyle(element);
        return [style.color, style.backgroundColor];
      }));
      for (const colors of bubbles) assert.ok(contrast(...colors) >= 4.5);
      assert.equal(await page.locator('.nexus-message').count(), count);
      if (process.env.NEXO_QA_DIR) {
        await page.screenshot({ path: path.join(process.env.NEXO_QA_DIR, `themes-conversation-${theme}.png`) });
      }
    }
    await page.locator('.sidebar-footer [data-theme-toggle]').click();
    await page.reload();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    assert.deepEqual(page.appErrors, []);
  } finally {
    await context.close();
  }
});
