import {test} from 'node:test';
import assert from 'node:assert/strict';

test('local edits persist, duplicates abort, snapshots do not mutate records, and quota failures are atomic',async()=>{
  const saved=new Map(); let full=false;
  globalThis.localStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>{if(full)throw Object.assign(new Error('quota'),{name:'QuotaExceededError'});saved.set(key,value);}};
  const store=await import('../local-store.js?test=persist');
  const path='casos/test-new';
  let notifications=0;
  const stop=store.onValue('casos',()=>notifications++);
  assert.equal(notifications,1);
  assert.equal((await store.runTransaction(path,current=>current===null?{numeroProntuario:'99'}:undefined)).committed,true);
  assert.equal((await store.runTransaction(path,current=>current===null?{}:undefined)).committed,false);
  const detached=(await store.get(path)).val();detached.numeroProntuario='mutated';
  assert.equal((await store.get(path)).val().numeroProntuario,'99');
  full=true;
  await assert.rejects(store.runTransaction(path,()=>({numeroProntuario:'changed'})),{name:'QuotaExceededError'});
  assert.equal((await store.get(path)).val().numeroProntuario,'99');
  assert.equal(notifications,2);
  full=false;
  const reloaded=await import('../local-store.js?test=reload');
  assert.equal((await reloaded.get(path)).val().numeroProntuario,'99');
  await store.runTransaction(`${path}/agenda`,()=>'{"revisao":1}');
  assert.equal((await store.get(path)).val().agenda,'{"revisao":1}');
  stop();await store.resetDemo();
  assert.equal((await store.get(path)).val(),null);
  delete globalThis.localStorage;
});

test('unavailable storage uses explicit in-memory fallback',async()=>{
  globalThis.localStorage={getItem:()=>{throw new Error('blocked');}};
  const store=await import('../local-store.js?test=blocked');
  assert.match(store.storageNotice,/apenas até recarregar/);
  await store.runTransaction('casos/memory',()=>({numeroProntuario:'88'}));
  assert.equal((await store.get('casos/memory')).val().numeroProntuario,'88');
  delete globalThis.localStorage;
});

// Migração e proteção: preserva a base anterior e nunca sobrescreve conteúdo inválido.
test('legacy session migrates once and corrupt persistent data is not overwritten', async () => {
  const saved = new Map();
  globalThis.localStorage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  globalThis.sessionStorage = { getItem: () => JSON.stringify({ casos: { antigo: { numeroProntuario: '42' } } }) };
  const store = await import('../local-store.js?test=migration');
  assert.equal((await store.get('casos/antigo')).val().numeroProntuario, '42');
  assert.ok(saved.has('nexo-laboratorio-casos-v1'));
  globalThis.sessionStorage = { getItem: () => JSON.stringify({ casos: {} }) };
  const reloaded = await import('../local-store.js?test=no-remigration');
  assert.equal((await reloaded.get('casos/antigo')).val().numeroProntuario, '42');
  saved.set(store.STORAGE_KEY, '{invalid');
  const corrupt = await import('../local-store.js?test=corrupt');
  assert.match(corrupt.storageNotice, /temporária/);
  await corrupt.runTransaction('casos/temporario', () => ({ numeroProntuario: '43' }));
  assert.equal(saved.get(store.STORAGE_KEY), '{invalid');
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
});
