const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../metrics.js');
const rows = (...values) => values.map(x => ({x}));

test('zero é válido; ausências, textos, negativos e infinitos não são', () => {
 assert.deepEqual(M.values(rows(0,null,undefined,'','8',NaN,Infinity,-1), 'x'), [0]);
});
test('soma distingue população vazia de população sem informação', () => {
 assert.equal(M.sum([], 'x'), 0);
 assert.equal(M.sum(rows(null,undefined,''), 'x'), null);
 assert.equal(M.sum(rows(0,null), 'x'), 0);
});
test('média usa somente observações válidas incluindo zeros', () => {
 assert.equal(M.mean(rows(0,10,null), 'x'), 5);
 assert.equal(M.mean(rows(null), 'x'), null);
 assert.equal(M.mean([], 'x'), null);
});
test('mediana ímpar ordena valores sem modificar a entrada', () => {
 const r=rows(90,10,20),before=structuredClone(r);
 assert.equal(M.median(r, 'x'), 20);
 assert.deepEqual(r,before);
});
test('mediana par usa os dois valores centrais válidos', () => {
 assert.equal(M.median(rows(40,10,null,20,30), 'x'), 25);
 assert.equal(M.median(rows(0,20), 'x'), 10);
 assert.equal(M.median(rows(null), 'x'), null);
});
test('média do recorte não é a média simples das médias dos grupos', () => {
 const r=rows(100,10,10,10);
 assert.equal(M.mean(r,'x'),32.5);
 assert.notEqual(M.mean(r,'x'),55);
});
test('divisão por zero e numerador ausente não geram taxa zero fictícia', () => {
 assert.equal(M.rate(0,0),null);
 assert.equal(M.rate(null,4),null);
 for(const n of [Infinity,'4',null,-1])assert.equal(M.rate(1,n),null);
 assert.equal(M.rate(0,4),0);
});
test('metas usam o mesmo denominador válido e não tratam nulos como falha', () => {
 const r=[100,0,null,undefined,'120'].map(Meta_Atingida_Pct=>({Meta_Atingida_Pct}));
 assert.deepEqual(M.summary(r).goals,{n:2,met:1,below:1,missing:3,share:50,mean:50});
});
test('metas acima de 100 são válidas e sem metas a taxa é indisponível', () => {
 assert.equal(M.summary([{Meta_Atingida_Pct:125}]).goals.share,100);
 assert.equal(M.summary([{Meta_Atingida_Pct:null}]).goals.share,null);
});
test('salários incluem apenas ativos com número válido', () => {
 const r=[{Status:'Ativo',Salario_Base:0},{Status:'Ativo',Salario_Base:10},{Status:'Ativo',Salario_Base:null},{Status:'Desligado',Salario_Base:900}];
 const s=M.summary(r);
 assert.equal(s.active,3);assert.equal(s.departed,1);
 assert.deepEqual(s.salary,{n:2,missing:1,total:10,mean:5,median:5});
});
test('nenhum ativo resulta em folha zero e média/mediana indisponíveis', () => {
 const s=M.summary([{Status:'Desligado',Salario_Base:50}]);
 assert.equal(s.salary.total,0);assert.equal(s.salary.mean,null);assert.equal(s.salary.median,null);
});
test('bônus anual é independente da folha mensal', () => {
 const s=M.summary([{Status:'Ativo',Salario_Base:100,Bonus_Anual_RS:1000}]);
 assert.equal(s.salary.total,100);assert.equal(s.bonus.total,1000);
});
test('taxa de ocorrências usa informação válida; zero não é ausência', () => {
 const s=M.summary([{Acidentes_Trabalho:2},{Acidentes_Trabalho:0},{Acidentes_Trabalho:null}]);
 assert.equal(s.accidents.n,2);assert.equal(s.accidents.people,1);assert.equal(s.accidents.rate,100);
 assert.equal(M.summary([{Acidentes_Trabalho:3}]).accidents.rate,300);
});
test('horas e idades ausentes não reduzem médias', () => {
 const s=M.summary([{Idade:20,Horas_Extra_Mes:0},{Idade:null,Horas_Extra_Mes:10},{Idade:40,Horas_Extra_Mes:null}]);
 assert.equal(s.age.mean,30);assert.equal(s.age.n,2);
 assert.equal(s.extra.mean,5);assert.equal(s.extra.n,2);
});
test('agrupamento preserva categorias especiais e identifica ausências', () => {
 const r=[{g:'__proto__'},{g:'constructor'},{g:null},{g:''},{g:'A'}];
 const groups=M.groups(r,'g');
 assert.equal(groups.find(g=>g.name==='Não informado').n,2);
 assert.equal(groups.find(g=>g.name==='__proto__').n,1);
 assert.equal(groups.reduce((n,g)=>n+g.n,0),r.length);
});
test('datas ISO são validadas pelo calendário', () => {
 assert.equal(M.validDate('2024-02-29'),true);
 for(const d of ['2023-02-29','2024-02-30','2024-13-01','2024-1-01','01/01/2024',null])assert.equal(M.validDate(d),false);
});
test('histórico trata admissão e desligamento no limite de 31/12', () => {
 const r=[{Status:'Ativo',Data_Admissao:'2023-12-31',Data_Desligamento:null},{Status:'Desligado',Data_Admissao:'2023-01-01',Data_Desligamento:'2023-12-31'},{Status:'Desligado',Data_Admissao:'2023-01-01',Data_Desligamento:'2024-01-01'}];
 assert.deepEqual(M.history(r),[{year:2023,admissions:3,departures:1,headcount:2},{year:2024,admissions:0,departures:1,headcount:1}]);
});
test('histórico com um único ano e universo sem datas', () => {
 assert.deepEqual(M.history([{Status:'Ativo',Data_Admissao:'2024-01-01'}]),[{year:2024,admissions:1,departures:0,headcount:1}]);
 assert.deepEqual(M.history([{Data_Admissao:null}]),[]);
});
test('histórico exclui datas inválidas e saídas anteriores à admissão', () => {
 const r=[{Status:'Ativo',Data_Admissao:'2024-02-30'},{Status:'Desligado',Data_Admissao:'2024-06-01',Data_Desligamento:'2024-05-01'}];
 const h=M.history(r);
 assert.equal(h[0].headcount,0);assert.equal(h[0].departures,0);
});
test('denominadores de subgrupos reconciliam com o total', () => {
 const r=[{g:'A',Meta_Atingida_Pct:100},{g:'A',Meta_Atingida_Pct:null},{g:'B',Meta_Atingida_Pct:0}];
 const sub=M.groups(r,'g').map(g=>M.summary(g.items));
 assert.equal(sub.reduce((n,s)=>n+s.goals.n,0),M.summary(r).goals.n);
 assert.equal(sub.reduce((n,s)=>n+s.goals.met,0),M.summary(r).goals.met);
});
test('controles independentes da base original permanecem iguais', () => {
 const text=fs.readFileSync(path.join(__dirname,'../data.js'),'utf8');
 const data=JSON.parse(text.slice(text.indexOf('['),text.indexOf('];')+1));
 const s=M.summary(data);
 assert.equal(s.people,100);assert.equal(s.active,91);assert.equal(s.departed,9);
 assert.equal(s.salary.total,1004900);assert.equal(s.salary.n,91);
 assert.ok(Math.abs(s.salary.mean-11042.857142857143)<1e-9);
 assert.equal(s.salary.median,10800);assert.equal(s.goals.met,64);assert.equal(s.goals.share,64);
 assert.equal(s.extra.total,1061);assert.equal(s.age.mean,33.15);assert.equal(s.accidents.total,6);
 const h=M.history(data);
 assert.equal(h.reduce((n,p)=>n+p.admissions,0),100);
 assert.equal(h.reduce((n,p)=>n+p.departures,0),9);
 assert.equal(h.at(-1).headcount,91);
 const byDept=M.groups(data,'Departamento');
 assert.equal(byDept.reduce((n,g)=>n+M.summary(g.items).salary.total,0),1004900);
});
