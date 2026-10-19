const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../Importador_Excel_Dados.html'),'utf8');
const script=html.match(/<script id="excel-validation">([\s\S]*?)<\/script>/)?.[1];
function api(){assert.ok(script,'shared production validation must exist');const sandbox={window:{},Date};vm.runInNewContext(script,sandbox);return sandbox.window.ExcelValidation;}
const utils={decode_range:()=>({s:{r:0,c:0},e:{r:1,c:2}}),encode_cell:({r,c})=>String.fromCharCode(65+c)+(r+1)};

test('calendar dates reject rollover, missing timezone and trailing text',()=>{
  const v=api();
  for(const date of ['2026-02-30','2026-02-29','2026-13-01','2026-01-00','2026-01-01junk','2026-01-01T12:00:00','2026-01-01T24:00:00Z','2026-02-30T12:00:00Z',null,new Date(NaN)])assert.throws(()=>v.date(date));
});
test('valid leap days and explicit timestamps retain their UTC semantics',()=>{
  const v=api();
  assert.equal(v.date('2024-02-29').toISOString(),'2024-02-29T00:00:00.000Z');
  assert.equal(v.date('2026-01-31T23:30:00-03:00').toISOString(),'2026-02-01T02:30:00.000Z');
  assert.equal(v.date(new Date('2026-10-19T00:00:00Z')).toISOString(),'2026-10-19T00:00:00.000Z');
});
test('duplicate non-empty headers never overwrite a selected column',()=>{
  const sheet={'!ref':'A1:C2',A1:{v:'id'},B1:{v:'saldo'},C1:{v:'saldo'},A2:{v:'fixture'},B2:{v:1},C2:{v:999}};
  assert.throws(()=>api().load(sheet,'Fixture',['saldo'],{utils}),/repetido/);
});
test('missing fields and spreadsheet errors do not become valid numbers',()=>{
  const sheet={'!ref':'A1:C2',A1:{v:'id'},B1:{v:'saldo'},A2:{v:'fixture'},B2:{t:'e',v:7}};
  assert.throws(()=>api().load(sheet,'Fixture',['absent'],{utils}),/coluna/);
  const table=api().load(sheet,'Fixture',['saldo'],{utils});
  assert.equal(table.rows.length,1);assert.equal(table.rows[0].__row,2);assert.equal(table.rows[0].saldo,undefined);
});
test('valid source values and their source coordinates are preserved',()=>{
  const sheet={'!ref':'A1:C2',A1:{v:'id'},B1:{v:'saldo'},C1:{v:'status'},A2:{v:'fixture'},B2:{v:0},C2:{v:'Ativo'}};
  const table=api().load(sheet,'Fixture',['id','saldo'],{utils});
  assert.equal(table.rows[0].saldo,0);assert.equal(table.rows[0].status,'Ativo');assert.equal(table.cols.get('saldo'),1);assert.equal(table.rows[0].__row,2);
});
