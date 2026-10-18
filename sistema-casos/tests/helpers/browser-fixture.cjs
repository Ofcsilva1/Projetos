const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.env.NEXO_TEST_ROOT || path.join(__dirname, '../..'));
const storageKey = 'nexo-demo-casos-v1';
const neutralFields = ['origem-caso','cor','situacao-atual','comunicacao-violencia','retorno-solicitado','estudo-caso','pia-elaborado'];
let browser;
before(async () => { browser = await chromium.launch({ headless:true, ...(process.env.NEXO_BROWSER_PATH ? { executablePath:process.env.NEXO_BROWSER_PATH } : {}) }); });
after(async () => { await browser?.close(); });

async function fixture(options = {}) {
  const context = await browser.newContext({ viewport:{width:1440,height:1000} });
  if (options.seed) await context.addInitScript(({key,seed}) => {
    if (!sessionStorage.getItem(key)) sessionStorage.setItem(key, JSON.stringify(seed));
  }, {key:storageKey,seed:options.seed});
  if (options.blocked) await context.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Synthetic unavailable storage'); };
  });
  const external = [];
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'nexo.test') {
      const name = decodeURIComponent(url.pathname.replace(/^\/sistema-casos\//, '')) || 'index.html';
      const filename = path.resolve(root, name);
      if (!filename.startsWith(root+path.sep) || !fs.existsSync(filename)) return route.abort();
      const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
      return route.fulfill({contentType:types[path.extname(filename)]||'application/octet-stream',body:fs.readFileSync(filename)});
    }
    external.push(url.href);
    if (/\/bootstrap@5\.3\.0\//.test(url.pathname)) {
      const name = url.pathname.endsWith('.js') ? 'bootstrap.bundle.min.js' : 'bootstrap.min.css';
      return route.fulfill({contentType:name.endsWith('.js')?'text/javascript':'text/css',body:fs.readFileSync(path.join(__dirname,'../fixtures/bootstrap-5.3.0',name))});
    }
    if (process.env.NEXO_TEST_ASSETS) {
      const names = ['bootstrap-icons.css','animate.min.css','jspdf.umd.min.js','jspdf.plugin.autotable.min.js','fonts/bootstrap-icons.woff2','fonts/bootstrap-icons.woff'];
      const name = names.find(n => url.pathname.endsWith('/'+n));
      if (name) return route.fulfill({contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'font/woff2',body:fs.readFileSync(path.join(process.env.NEXO_TEST_ASSETS,name))});
    }
    return route.fulfill({contentType:url.pathname.endsWith('.js')?'text/javascript':'text/css',body:''});
  });
  const page = await context.newPage(); page.appErrors=[]; page.external=external;
  page.on('pageerror',error=>page.appErrors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')page.appErrors.push(message.text());});
  page.setDefaultTimeout(15000);
  await page.goto('https://nexo.test/sistema-casos/' + (options.hash || ''));
  await page.waitForFunction(()=>document.documentElement.dataset.demoReady==='true');
  if (!options.noLogin) {
    await page.locator('#btnLogin').click();
    await page.waitForFunction(()=>!document.getElementById('app-wrapper').hidden);
  }
  return {page,context};
}
async function guard(page) {return page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;});}
async function records(page) {return page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)).casos,storageKey);}
async function tab(page, id) {
  await page.locator(`[data-bs-target="#${id}"]`).click();
  await page.waitForFunction(id=>document.getElementById(id).classList.contains('show')&&getComputedStyle(document.getElementById(id)).opacity==='1',id);
}


module.exports = { fixture, guard, records, tab, storageKey, neutralFields };
