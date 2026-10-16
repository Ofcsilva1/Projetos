import {test} from 'node:test';
import assert from 'node:assert/strict';

test('local edits persist, duplicates abort, snapshots do not mutate records, and quota failures are atomic',async()=>{
  const saved=new Map(); let full=false;
  globalThis.sessionStorage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>{if(full)throw Object.assign(new Error('quota'),{name:'QuotaExceededError'});saved.set(key,value);}};
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
  stop();store.resetDemo();
  assert.equal((await store.get(path)).val(),null);
  delete globalThis.sessionStorage;
});

test('unavailable storage uses explicit in-memory fallback',async()=>{
  globalThis.sessionStorage={getItem:()=>{throw new Error('blocked');}};
  const store=await import('../local-store.js?test=blocked');
  assert.match(store.storageNotice,/apenas até recarregar/);
  await store.runTransaction('casos/memory',()=>({numeroProntuario:'88'}));
  assert.equal((await store.get('casos/memory')).val().numeroProntuario,'88');
  delete globalThis.sessionStorage;
});
