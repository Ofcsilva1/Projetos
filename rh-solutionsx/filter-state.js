// Estado puro de filtros e URL. Nenhuma mutação da fonte ou cálculo de métricas.
(function(root, factory) {
 const api=factory(typeof module==='object'&&module.exports?require('./metrics.js'):root.RHMetrics);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.RHFilterState=api;
})(globalThis, function(M) {
 'use strict';
 const dimensions=Object.freeze({department:'Departamento',job:'Cargo',uf:'UF_Alocacao',model:'Modelo_Trabalho',status:'Status',level:'Nivel_Cargo',gender:'Genero',ethnicity:'Etnia',reason:'Motivo_Desligamento',exitType:'Tipo_Desligamento'});
 const labels=Object.freeze({department:'Departamento',job:'Cargo',uf:'UF',model:'Modelo de trabalho',status:'Status',level:'Senioridade',gender:'Gênero',ethnicity:'Etnia',reason:'Motivo da saída',exitType:'Tipo de saída',ageBand:'Faixa etária',targetBand:'Faixa de meta',salaryBand:'Faixa salarial (ativos)',incident:'Acidentes',exitMonth:'Mês de desligamento'});
 const bands=Object.freeze({
  ageBand:{under25:'Até 24 anos',from25to34:'25–34 anos',from35to44:'35–44 anos',over44:'45 anos ou mais'},
  targetBand:{under80:'Abaixo de 80%',from80to100:'80 a <100%',from100to110:'100 a <110%',over110:'110% ou mais'},
  salaryBand:{upto5000:'Até R$ 5 mil',from5000to10000:'5 a 10 mil',from10000to15000:'10 a 15 mil',over15000:'Acima de 15 mil'},
  incident:{with:'Com ocorrência',without:'Sem ocorrência',unknown:'Sem informação'}
 });
 const enums=Object.freeze({view:['overview','people','performance','safety','departures','method'],dateBasis:['none','admission','departure','either'],tableGroup:['Departamento','UF_Alocacao','Cargo'],sort:['name','n','age','extra','extraMean','accidents','rate','target','salary','salaryMean','salaryMedian','nSalary','nGoals','nAccidents','nAge','nExtra'],direction:['asc','desc'],trend:['headcount','movement'],safety:['Departamento','UF_Alocacao','Cargo']});
 const defaults=Object.freeze({...Object.fromEntries(Object.keys(dimensions).map(key=>[key,''])),...Object.fromEntries(Object.keys(bands).map(key=>[key,''])),exitMonth:'',view:'overview',dateBasis:'none',from:'',to:'',tableGroup:'Departamento',sort:'n',direction:'desc',search:'',trend:'headcount',safety:'Departamento'});
 const category=value=>value==null||String(value).trim()===''?'Não informado':String(value);
 function catalog(rows) {
  return {...Object.fromEntries(Object.entries(dimensions).map(([key,field])=>[key,[...new Set(rows.map(row=>category(row[field])))].sort((a,b)=>a.localeCompare(b,'pt-BR'))])),exitMonth:[...new Set(rows.filter(row=>M.validDate(row.Data_Desligamento)).map(row=>row.Data_Desligamento.slice(0,7)))].sort()};
 }
 function validatePeriod({dateBasis,from,to}) {
  if(!enums.dateBasis.includes(dateBasis))return 'Selecione um tipo de movimentação válido.';
  if(dateBasis==='none')return from||to?'Selecione a movimentação antes de informar datas.':'';
  if((from&&!M.validDate(from))||(to&&!M.validDate(to)))return 'Informe datas válidas no calendário.';
  if(from&&to&&from>to)return 'A data inicial deve ser anterior ou igual à data final.';
  return '';
 }
 function normalize(input, available) {
  const state={...defaults},warnings=[];
  for(const key of Object.keys(dimensions)) {
   const value=input[key];
   if(typeof value==='string'&&(available[key]||[]).includes(value))state[key]=value;
   else if(value)warnings.push(key);
  }
  for(const [key,options] of Object.entries(bands)) {
   const value=input[key];
   if(typeof value==='string'&&Object.hasOwn(options,value))state[key]=value;
   else if(value)warnings.push(key);
  }
  if(typeof input.exitMonth==='string'&&(available.exitMonth||[]).includes(input.exitMonth))state.exitMonth=input.exitMonth;
  else if(input.exitMonth)warnings.push('exitMonth');
  for(const [key,options] of Object.entries(enums)) {
   if(options.includes(input[key]))state[key]=input[key];
   else if(input[key])warnings.push(key);
  }
  state.from=typeof input.from==='string'?input.from:'';
  state.to=typeof input.to==='string'?input.to:'';
  if(validatePeriod(state)) {state.dateBasis='none';state.from='';state.to='';warnings.push('period');}
  state.search=typeof input.search==='string'?input.search.slice(0,120):'';
  return {state,warnings:[...new Set(warnings)]};
 }
 function parse(search,available) {
  const params=new URLSearchParams(search);
  const input=Object.fromEntries(Object.keys(defaults).filter(key=>params.has(key)).map(key=>[key,params.get(key)]));
  return normalize(input,available);
 }
 function serialize(state) {
  const params=new URLSearchParams();
  for(const key of Object.keys(defaults))if(state[key]!==defaults[key])params.set(key,state[key]);
  return params.toString();
 }
 function inRange(date,state) {
  return M.validDate(date)&&(!state.from||date>=state.from)&&(!state.to||date<=state.to);
 }
 function matchesBand(row,key,value) {
  const field={ageBand:'Idade',targetBand:'Meta_Atingida_Pct',salaryBand:'Salario_Base'}[key];
  const n=row[field];
  if(!M.valid(n)||(key==='salaryBand'&&row.Status!=='Ativo'))return false;
  const predicates={under25:n<=24,from25to34:n>=25&&n<=34,from35to44:n>=35&&n<=44,over44:n>=45,under80:n<80,from80to100:n>=80&&n<100,from100to110:n>=100&&n<110,over110:n>=110,upto5000:n<=5000,from5000to10000:n>5000&&n<=10000,from10000to15000:n>10000&&n<=15000,over15000:n>15000};
  return predicates[value]===true;
 }
 function select(rows,state) {
  return rows.filter(row=>{
   if(!Object.entries(dimensions).every(([key,field])=>!state[key]||category(row[field])===state[key]))return false;
   if(!['ageBand','targetBand','salaryBand'].every(key=>!state[key]||matchesBand(row,key,state[key])))return false;
   if(state.incident) {
    const group=!M.valid(row.Acidentes_Trabalho)?'unknown':row.Acidentes_Trabalho>0?'with':'without';
    if(group!==state.incident)return false;
   }
   if(state.exitMonth&&!(row.Status==='Desligado'&&M.validDate(row.Data_Admissao)&&M.validDate(row.Data_Desligamento)&&row.Data_Desligamento>=row.Data_Admissao&&row.Data_Desligamento.startsWith(state.exitMonth)))return false;
   if(state.dateBasis==='none')return true;
   const admission=inRange(row.Data_Admissao,state);
   const departure=row.Status==='Desligado'&&M.validDate(row.Data_Admissao)&&M.validDate(row.Data_Desligamento)&&row.Data_Desligamento>=row.Data_Admissao&&inRange(row.Data_Desligamento,state);
   return state.dateBasis==='admission'?admission:state.dateBasis==='departure'?departure:admission||departure;
  });
 }
 function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));
 }
 function periodLabel(state) {
  if(state.dateBasis==='none')return '';
  const basis={admission:'Admissão',departure:'Desligamento',either:'Admissão ou desligamento'}[state.dateBasis];
  const range=state.from&&state.to?`${formatDate(state.from)} a ${formatDate(state.to)}`:state.from?`a partir de ${formatDate(state.from)}`:state.to?`até ${formatDate(state.to)}`:'todas as datas válidas';
  return `${basis}: ${range}`;
 }
 function describe(state) {
  const chips=[];
  for(const key of [...Object.keys(dimensions),...Object.keys(bands),'exitMonth'])if(state[key]) {
   let value=state[key];
   if(bands[key])value=bands[key][value];
   if(key==='exitMonth')value=new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'-01T00:00:00Z'));
   chips.push({key,label:`${labels[key]}: ${value}`});
  }
  if(state.dateBasis!=='none')chips.push({key:'period',label:periodLabel(state)});
  return chips;
 }
 function cleared(state) {
  return {...state,...Object.fromEntries([...Object.keys(dimensions),...Object.keys(bands),'exitMonth'].map(key=>[key,''])),dateBasis:'none',from:'',to:'',search:''};
 }
 return Object.freeze({dimensions,labels,bands,defaults,category,catalog,normalize,parse,serialize,validatePeriod,select,periodLabel,describe,cleared});
});
