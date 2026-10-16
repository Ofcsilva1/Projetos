import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareImport} from '../import-core.js';
test('existing spreadsheet headers and generic headers retain dates and fields',()=>{
  for(const brand of ['PROTEJA','gestao-casos']) {
    const values={'Prontuário':'77',[`Entrada no ${brand}`]:'2026-01-10','Nome da CRIAD':'Pessoa fictícia', [`Comunicação da Violência pelo ${brand}`]:'Texto fictício'};
    const result=prepareImport({sheets:[{name:'Casos',headers:Object.keys(values),rows:[{row:2,values,errors:[]}]}]});
    assert.equal(result.plans[0].data.numeroProntuario,'77');
    assert.equal(result.plans[0].data.dataEntrada,'2026-01-10');
    assert.equal(result.plans[0].data.comunicacaoViolencia,'Texto fictício');
  }
});
