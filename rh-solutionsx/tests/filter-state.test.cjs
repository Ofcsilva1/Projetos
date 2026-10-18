const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const S=require('../filter-state.js');
const rows=[
 {Departamento:'Área A',Cargo:'Cargo & A',Nivel_Cargo:'Senior',Status:'Ativo',UF_Alocacao:'SP',Modelo_Trabalho:'Remoto',Genero:'Feminino',Etnia:'Parda',Idade:24,Meta_Atingida_Pct:100,Salario_Base:5000,Acidentes_Trabalho:0,Data_Admissao:'2023-01-01',Data_Desligamento:null},
 {Departamento:'Área A',Cargo:'Cargo B',Nivel_Cargo:'Junior',Status:'Desligado',UF_Alocacao:'RJ',Modelo_Trabalho:'Presencial',Genero:'Masculino',Etnia:'Branca',Idade:25,Meta_Atingida_Pct:80,Salario_Base:10000,Acidentes_Trabalho:1,Data_Admissao:'2023-12-31',Data_Desligamento:'2024-01-01'},
 {Departamento:'Área B',Cargo:'Cargo & A',Nivel_Cargo:'Senior',Status:'Desligado',UF_Alocacao:'SP',Modelo_Trabalho:'Remoto',Genero:'Feminino',Etnia:'Parda',Idade:35,Meta_Atingida_Pct:110,Salario_Base:15000,Acidentes_Trabalho:null,Data_Admissao:'2023-02-01',Data_Desligamento:'2023-12-31'},
 {Departamento:'Área B',Cargo:null,Nivel_Cargo:null,Status:'Ativo',UF_Alocacao:'SP',Modelo_Trabalho:'Remoto',Genero:'Feminino',Etnia:'Parda',Idade:null,Meta_Atingida_Pct:null,Salario_Base:null,Acidentes_Trabalho:null,Data_Admissao:'2024-02-30',Data_Desligamento:null}
];
const catalog=S.catalog(rows);
const state=patch=>S.normalize({...S.defaults,...patch},catalog).state;
test('catálogo representa cargos ausentes e não modifica a fonte',()=>{
 const before=structuredClone(rows);
 assert.ok(catalog.job.includes('Não informado'));assert.ok(catalog.level.includes('Senior'));
 assert.deepEqual(rows,before);
});
test('cargo, senioridade e departamento se combinam por interseção',()=>{
 assert.deepEqual(S.select(rows,state({job:'Cargo & A',level:'Senior',department:'Área A'})),[rows[0]]);
 assert.deepEqual(S.select(rows,state({job:'Cargo B',level:'Senior'})),[]);
});
test('normalização de categorias ausentes é a mesma do agrupamento',()=>{
 assert.deepEqual(S.select(rows,state({job:'Não informado'})),[rows[3]]);
});
test('seleção de gênero e etnia combina com modelo e UF',()=>{
 assert.deepEqual(S.select(rows,state({gender:'Feminino',ethnicity:'Parda',model:'Remoto',uf:'SP'})),[rows[0],rows[2],rows[3]]);
});
test('faixas de idade têm limites consistentes e excluem nulos',()=>{
 assert.deepEqual(S.select(rows,state({ageBand:'under25'})),[rows[0]]);
 assert.deepEqual(S.select(rows,state({ageBand:'from25to34'})),[rows[1]]);
 assert.deepEqual(S.select(rows,state({ageBand:'from35to44'})),[rows[2]]);
});
test('faixas de meta não sobrepõem limites nem incluem ausência',()=>{
 assert.deepEqual(S.select(rows,state({targetBand:'from80to100'})),[rows[1]]);
 assert.deepEqual(S.select(rows,state({targetBand:'from100to110'})),[rows[0]]);
 assert.deepEqual(S.select(rows,state({targetBand:'over110'})),[rows[2]]);
});
test('faixa salarial aplica somente aos ativos',()=>{
 assert.deepEqual(S.select(rows,state({salaryBand:'upto5000'})),[rows[0]]);
 assert.deepEqual(S.select(rows,state({salaryBand:'from5000to10000'})),[]);
});
test('acidentes distinguem zero, ocorrência e informação ausente',()=>{
 assert.deepEqual(S.select(rows,state({incident:'without'})),[rows[0]]);
 assert.deepEqual(S.select(rows,state({incident:'with'})),[rows[1]]);
 assert.deepEqual(S.select(rows,state({incident:'unknown'})),[rows[2],rows[3]]);
});
test('admissão usa limites inclusivos e valida datas',()=>{
 assert.deepEqual(S.select(rows,state({dateBasis:'admission',from:'2023-01-01',to:'2023-12-31'})),rows.slice(0,3));
 assert.deepEqual(S.select(rows,state({dateBasis:'admission',from:'2023-12-31',to:'2023-12-31'})),[rows[1]]);
});
test('desligamento usa data de saída em vez da admissão',()=>{
 assert.deepEqual(S.select(rows,state({dateBasis:'departure',from:'2024-01-01',to:'2024-12-31'})),[rows[1]]);
 assert.deepEqual(S.select(rows,state({dateBasis:'departure'})),[rows[1],rows[2]]);
});
test('admissão ou saída não duplica pessoa com ambos eventos no período',()=>{
 const result=S.select(rows,state({dateBasis:'either',from:'2023-01-01',to:'2023-12-31'}));
 assert.deepEqual(result,rows.slice(0,3));
 assert.equal(new Set(result).size,3);
});
test('datas abertas em um dos lados são aceitas',()=>{
 assert.deepEqual(S.select(rows,state({dateBasis:'admission',to:'2023-01-01'})),[rows[0]]);
 assert.deepEqual(S.select(rows,state({dateBasis:'departure',from:'2024-01-01'})),[rows[1]]);
});
test('mês de saída pode cruzar departamento ou outro período',()=>{
 assert.deepEqual(S.select(rows,state({exitMonth:'2023-12',department:'Área B'})),[rows[2]]);
 assert.deepEqual(S.select(rows,state({exitMonth:'2023-12',dateBasis:'departure',from:'2024-01-01'})),[]);
});
test('período inválido é rejeitado sem criar uma seleção silenciosa',()=>{
 assert.ok(S.validatePeriod({dateBasis:'admission',from:'2024-03-01',to:'2024-02-01'}));
 assert.ok(S.validatePeriod({dateBasis:'admission',from:'2024-02-30',to:''}));
 assert.ok(S.validatePeriod({dateBasis:'none',from:'2024-01-01',to:''}));
});
test('parâmetro de período inválido é removido e gera aviso',()=>{
 const parsed=S.parse('?dateBasis=admission&from=2024-03-01&to=2024-02-01&department=%C3%81rea+A',catalog);
 assert.equal(parsed.state.dateBasis,'none');assert.equal(parsed.state.from,'');
 assert.equal(parsed.state.department,'Área A');assert.ok(parsed.warnings.includes('period'));
});
test('estado completo faz ida e volta na URL com caracteres especiais',()=>{
 const current=state({view:'performance',job:'Cargo & A',gender:'Feminino',dateBasis:'admission',from:'2023-01-01',to:'2023-12-31',tableGroup:'Cargo',search:'Á & "<tag>"',sort:'salaryMedian',direction:'asc',trend:'movement',safety:'Cargo'});
 assert.deepEqual(S.parse(S.serialize(current),catalog).state,current);
});
test('URL não aceita chaves arbitrárias, enums ou categorias inválidas',()=>{
 const parsed=S.parse('?view=evil&job=UNKNOWN&targetBand=__proto__&sort=constructor&__proto__=bad&redirect=https://example.com',catalog);
 assert.equal(parsed.state.view,'overview');assert.equal(parsed.state.job,'');assert.equal(parsed.state.targetBand,'');assert.equal(parsed.state.sort,'n');
 assert.ok(!Object.hasOwn(parsed.state,'redirect'));assert.ok(!Object.hasOwn(parsed.state,'__proto__'));
 assert.equal(S.serialize(parsed.state),'');
});
test('busca e configuração da tabela não alteram o recorte global',()=>{
 assert.deepEqual(S.select(rows,state({search:'Cargo B',view:'people',tableGroup:'Cargo',sort:'age'})),rows);
 assert.equal(state({search:'a'.repeat(200)}).search.length,120);
});
test('limpar filtros preserva navegação e configuração da tabela',()=>{
 const current=state({view:'performance',tableGroup:'Cargo',sort:'salaryMean',direction:'asc',job:'Cargo B',gender:'Masculino',search:'Cargo',dateBasis:'departure',from:'2024-01-01'});
 const cleared=S.cleared(current);
 assert.equal(cleared.view,'performance');assert.equal(cleared.tableGroup,'Cargo');assert.equal(cleared.sort,'salaryMean');
 assert.equal(cleared.job,'');assert.equal(cleared.gender,'');assert.equal(cleared.search,'');assert.equal(cleared.dateBasis,'none');assert.equal(cleared.from,'');
});
test('etiquetas descrevem período e seleção com datas UTC',()=>{
 const chips=S.describe(state({department:'Área A',dateBasis:'admission',from:'2023-01-01',to:'2023-12-31'}));
 assert.equal(chips[0].label,'Departamento: Área A');
 assert.equal(chips.at(-1).label,'Admissão: 01/01/2023 a 31/12/2023');
});
test('dados originais reconciliam coortes por cálculos independentes',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../data.js'),'utf8');
 const data=JSON.parse(src.slice(src.indexOf('['),src.indexOf('];')+1));
 const available=S.catalog(data);
 const admission=S.normalize({...S.defaults,dateBasis:'admission',from:'2023-01-01',to:'2023-12-31'},available).state;
 const departure=S.normalize({...S.defaults,dateBasis:'departure',from:'2024-01-01',to:'2024-12-31'},available).state;
 assert.deepEqual(S.select(data,admission),data.filter(r=>r.Data_Admissao>='2023-01-01'&&r.Data_Admissao<='2023-12-31'));
 assert.equal(S.select(data,admission).length,15);
 assert.equal(S.select(data,departure).length,4);
 assert.equal(S.select(data,S.defaults).length,100);
});
