'use strict';
const $=id=>document.getElementById(id);
const M=globalThis.RHMetrics;
const fmt=(n,d=0)=>M.valid(n)?n.toLocaleString('pt-BR',{maximumFractionDigits:d,minimumFractionDigits:d}):'—';
const money=(n,d=0)=>M.valid(n)?n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:d,minimumFractionDigits:d}):'—';
const esc=s=>String(s??'Não informado').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sum=M.sum;
const mean=M.mean;
const colors=['#3b7d9c','#183e55','#bd965b','#8fa8ac','#bdcac6','#8d897c'];
const chartState={timeline:'headcount',safety:'Departamento'};
let tab='overview', tableKey='Departamento', tableSort='n', tableDirection=-1, tableSearch='';
const filters={department:'Departamento',uf:'UF_Alocacao',model:'Modelo_Trabalho',status:'Status'};
for(const [id,key] of Object.entries(filters)){
 $(id).innerHTML='<option value="">Todos</option>'+[...new Set(DATA.map(r=>r[key]))].sort((a,b)=>a.localeCompare(b,'pt-BR')).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
 $(id).onchange=render;
}
const selected=()=>DATA.filter(r=>Object.entries(filters).every(([id,key])=>!$(id).value||r[key]===$(id).value));
const groups=M.groups;
const panel=(title,caption,body,control='')=>`<section class="panel"><div class="panel-head"><div><h2>${title}</h2><p class="caption">${caption}</p></div>${control}</div>${body}</section>`;
const choice=(id,options,value)=>`<select id="${id}" aria-label="${id==='group'?'Agrupar indicadores por':id==='metric'?'Indicador do gráfico':'Visualização do gráfico'}">${options.map(([v,l])=>`<option value="${v}" ${value===v?'selected':''}>${l}</option>`).join('')}</select>`;
const dimensions=[['Departamento','Departamento'],['UF_Alocacao','UF'],['Cargo','Cargo']];
function kpis(rows){
 const s=M.summary(rows);
 const values=[['Colaboradores ativos',fmt(s.active),`${fmt(s.people)} registros no recorte`],['Folha base mensal',money(s.salary.total),`${s.salary.n} ativos com salário · sem encargos e benefícios`],['Pessoas com meta ≥ 100%',s.goals.share===null?'—':fmt(s.goals.share,1)+'%',`${s.goals.met} de ${s.goals.n} registros com meta válida`],['Horas extras no mês',fmt(s.extra.total)+(s.extra.total===null?'':' h'),`${s.extra.n} registros com horas · mês não informado`],['Idade média',s.age.mean===null?'—':fmt(s.age.mean,1)+' anos',`Média de ${s.age.n} idades válidas`]];
 return `<div class="kpis">${values.map((v,i)=>`<article class="kpi"><div class="kpi-heading"><span class="kpi-label">${v[0]}</span><svg class="icon" aria-hidden="true"><use href="#i-${['people','money','target','clock','calendar'][i]}"/></svg></div><strong>${v[1]}</strong><small>${v[2]}</small></article>`).join('')}</div>`;
}
function bars(rows,key,metric='count',limit=100){
 if(!rows.length)return '<p class="empty">Nenhum registro para este recorte.</p>';
 const field=({age:'Idade',target:'Meta_Atingida_Pct',salary:'Salario_Base',salaryTotal:'Salario_Base',extra:'Horas_Extra_Mes',extraTotal:'Horas_Extra_Mes'})[metric]||'Acidentes_Trabalho';
 const items=groups(rows,key).map(g=>({...g,v:metric==='count'?g.n:metric==='age'?mean(g.items,'Idade'):metric==='target'?mean(g.items,'Meta_Atingida_Pct'):metric==='salary'?mean(g.items,'Salario_Base'):metric==='extra'?mean(g.items,'Horas_Extra_Mes'):metric==='extraTotal'?sum(g.items,'Horas_Extra_Mes'):metric==='salaryTotal'?sum(g.items,'Salario_Base'):M.summary(g.items).accidents.rate})).sort((a,b)=>(a.v===null)-(b.v===null)||(b.v??0)-(a.v??0)||a.name.localeCompare(b.name)).slice(0,limit);
 const max=Math.max(...items.map(g=>g.v??0),1);
 return items.map(g=>`<div class="bar-row"><span class="bar-label">${esc(g.name)}<small>${g.n} pessoas${metric==='count'?'':' · '+M.values(g.items,field).length+' valores válidos'}${metric==='accident'?' · '+fmt(sum(g.items,'Acidentes_Trabalho'))+' ocorrências':''}</small></span>${g.v===null?'<span class="caption">Sem informação</span>':`<div class="track"><div class="fill" style="width:${g.v/max*100}%;background:${metric==='accident'?'#d99a35':'#1978b8'}"></div></div>`}<span class="bar-value">${['salary','salaryTotal'].includes(metric)?money(g.v):fmt(g.v,metric==='count'?0:1)}${g.v===null?'':({age:' anos',target:'%',extra:' h',extraTotal:' h',accident:''})[metric]||''}</span></div>`).join('')+(groups(rows,key).length>limit?`<p class="caption">Exibindo os ${limit} maiores valores. Todos os grupos estão na tabela.</p>`:'');
}
function donut(rows,key){
 if(!rows.length)return '<p class="empty">Nenhum registro para este recorte.</p>';
 const gs=groups(rows,key).sort((a,b)=>b.n-a.n);let offset=0;
 const segments=gs.map((g,i)=>{const length=g.n/rows.length*100,start=offset;offset+=length;return `<circle class="donut-segment chart-point" tabindex="0" data-tip="${esc(g.name+': '+g.n+' pessoas ('+fmt(length,1)+'%)')}" cx="70" cy="70" r="52" fill="none" stroke="${colors[i%colors.length]}" stroke-width="19" pathLength="100" stroke-dasharray="${length} ${100-length}" stroke-dashoffset="${-start}" transform="rotate(-90 70 70)" aria-label="${esc(g.name+': '+g.n+' pessoas')}"><title>${esc(g.name)}: ${g.n} pessoas</title></circle>`}).join('');
 return `<div class="donut-wrap"><div class="donut-svg"><svg viewBox="0 0 140 140" role="img" aria-label="${esc(gs.map(g=>g.name+': '+g.n).join(', '))}">${segments}<text x="70" y="70" text-anchor="middle" class="donut-total">${rows.length}</text><text x="70" y="88" text-anchor="middle" class="donut-subtitle">pessoas</text></svg></div><div class="donut-legend">${gs.map((g,i)=>`<div><i style="background:${colors[i%colors.length]}"></i><span>${esc(g.name)}</span><b>${fmt(g.n/rows.length*100,1)}% <small>(${g.n})</small></b></div>`).join('')}</div></div>`;
}
function timeline(rows,mode='headcount'){
 if(!rows.length)return '<p class="empty">Nenhum registro para este recorte.</p>';
 const history=M.history(rows,DATA);
 if(!history.length)return '<p class="empty">Não há datas válidas para reconstruir o histórico.</p>';
 const years=history.map(p=>p.year),start=years[0],end=years.at(-1);
 const series=mode==='headcount'?[{name:'Quadro reconstruído',color:colors[0],values:history.map(p=>p.headcount)}]:[{name:'Admissões',color:colors[0],values:history.map(p=>p.admissions)},{name:'Desligamentos',color:colors[2],values:history.map(p=>p.departures)}];
 const max=Math.max(1,...series.flatMap(s=>s.values)),ceiling=Math.ceil(max/4)*4;
 const x=i=>years.length===1?490:60+i*860/(years.length-1),y=v=>265-v/ceiling*200;
 const smoothPath=values=>{
  const points=values.map((v,i)=>({x:x(i),y:y(v)}));
  const slopes=points.slice(1).map((p,i)=>(p.y-points[i].y)/(p.x-points[i].x));
  const tangent=points.map((_,i)=>{if(!i)return slopes[0];if(i===points.length-1)return slopes.at(-1);const a=slopes[i-1],b=slopes[i];return a*b<=0?0:2*a*b/(a+b)});
  return points.reduce((path,p,i)=>{if(!i)return `M ${p.x} ${p.y}`;const previous=points[i-1],step=(p.x-previous.x)/3;return path+` C ${previous.x+step} ${previous.y+tangent[i-1]*step}, ${p.x-step} ${p.y-tangent[i]*step}, ${p.x} ${p.y}`},'');
 };
 const headPath=mode==='headcount'?smoothPath(series[0].values):'';
 const area=mode==='headcount'?`<path class="timeline-area" d="${headPath} L ${x(years.length-1)} 265 L ${x(0)} 265 Z" fill="url(#timeline-area-gradient)"/><path class="timeline-curve" d="${headPath}" fill="none" stroke="${colors[0]}" stroke-width="3"/>`:'';
 const labels=series.map((s,si)=>s.values.map((v,i)=>{
  const cx=x(i),cy=y(v),above=mode==='headcount'||((series[0].values[i]>=series[1].values[i])===(si===0)),labelY=cy+(above?-22:20);
  return `<g class="chart-point timeline-point series-${si}" tabindex="0" aria-label="${s.name} em ${years[i]}: ${v} pessoas" data-tip="${s.name} · ${years[i]}: ${v} pessoas"><circle cx="${cx}" cy="${cy}" r="4.5" fill="${s.color}" stroke-width="2" class="timeline-dot"/><rect class="timeline-label-box" x="${cx-17}" y="${labelY-11}" width="34" height="22" rx="6"/><text class="timeline-value" x="${cx}" y="${labelY+4}" text-anchor="middle" data-value="${v}" data-year="${years[i]}" data-series="${s.name}">${fmt(v)}</text><title>${s.name} · ${years[i]}: ${v} pessoas</title></g>`;
 }).join('')).join('');
 const svg=`<svg class="chart timeline-chart" viewBox="0 0 960 350" role="img" aria-label="${series.map(s=>s.name).join(' e ')} por ano"><defs><linearGradient id="timeline-area-gradient" x1="0" y1="0" x2="0" y2="1"><stop class="timeline-gradient-stop" offset="0%" stop-color="${colors[0]}" stop-opacity=".32"/><stop class="timeline-gradient-stop" offset="100%" stop-color="${colors[0]}" stop-opacity=".02"/></linearGradient></defs><text x="60" y="16">Colaboradores (n)</text>${Array.from({length:5},(_,i)=>`<line x1="60" x2="920" y1="${y(i*ceiling/4)}" y2="${y(i*ceiling/4)}" stroke="#e7edf2"/><text x="46" y="${y(i*ceiling/4)+4}" text-anchor="end">${i*ceiling/4}</text>`).join('')}${area}${mode==='headcount'?'':series.map(s=>`<polyline points="${s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="${s.color}" stroke-width="3"/>`).join('')}${labels}${years.map((v,i)=>`<text x="${x(i)}" y="310" text-anchor="middle">${v}</text>`).join('')}<text x="920" y="340" text-anchor="end">${mode==='headcount'?'Ano (posição em 31/12)':'Ano das movimentações'}</text></svg>`;
 return '<div class=chart-scroll>'+svg+'</div>'+`<div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${s.name}</span>`).join('')}</div><p class="caption">Histórico de ${start} a ${end}, reconstruído somente com as pessoas presentes na base. Pode não refletir o quadro completo da empresa. Os filtros usam o status e os atributos registrados.</p>`;
}
function bubbles(rows){
 if(!rows.length)return '<p class="empty">Nenhum registro para este recorte.</p>';
 const paired=rows.filter(r=>M.valid(r.Horas_Extra_Mes)&&M.valid(r.Meta_Atingida_Pct));
 const gs=groups(paired,'Departamento');
 if(!gs.length)return '<p class="empty">Não há pares válidos de horas extras e metas neste recorte.</p>';
 const xmax=Math.max(...gs.map(g=>mean(g.items,'Horas_Extra_Mes')),1)*1.25,ymax=Math.max(...gs.map(g=>mean(g.items,'Meta_Atingida_Pct')),100)*1.18;
 const x=v=>65+v/xmax*790,y=v=>260-v/ymax*215;
 return `<div class="chart-scroll"><svg class="chart" viewBox="0 0 960 320" role="img" aria-label="Horas extras médias por pessoa e atingimento médio de metas por departamento"><text x="65" y="18">Atingimento médio das metas (%)</text>${Array.from({length:5},(_,i)=>`<line x1="65" x2="855" y1="${y(ymax*i/4)}" y2="${y(ymax*i/4)}" stroke="#e7edf2"/><text x="52" y="${y(ymax*i/4)+4}" text-anchor="end">${fmt(ymax*i/4)}</text><text x="${x(xmax*i/4)}" y="282" text-anchor="middle">${fmt(xmax*i/4,1)}</text>`).join('')}<line x1="65" x2="855" y1="${y(100)}" y2="${y(100)}" stroke="#d99a35" stroke-dasharray="5 5"/><text x="864" y="${y(100)+4}">100%</text>${gs.map((g,i)=>`<circle class="bubble" tabindex="0" aria-label="${esc(g.name)}: ${g.n} pessoas, ${fmt(mean(g.items,'Horas_Extra_Mes'),1)} horas extras médias e ${fmt(mean(g.items,'Meta_Atingida_Pct'),1)}% de meta" cx="${x(mean(g.items,'Horas_Extra_Mes'))}" cy="${y(mean(g.items,'Meta_Atingida_Pct'))}" r="${Math.sqrt(g.n)*6}" fill="${colors[i%colors.length]}" opacity=".75"><title>${esc(g.name)} · n=${g.n} · ${fmt(mean(g.items,'Horas_Extra_Mes'),1)} h/pessoa · meta média ${fmt(mean(g.items,'Meta_Atingida_Pct'),1)}%</title></circle>`).join('')}<text x="855" y="310" text-anchor="end">Horas extras médias por pessoa (h/mês)</text></svg></div><p class="caption">Área da bolha proporcional às pessoas com pares válidos de horas extras e meta. Passe o cursor ou foque uma bolha para identificá-la. Relação descritiva, sem inferência de causa.</p><div class="legend">${gs.map((g,i)=>`<span><i style="background:${colors[i%colors.length]}"></i>${esc(g.name)}</span>`).join('')}</div>`;
}
function table(rows){
 return panel('Detalhamento por grupo','Totais, médias e medianas do recorte. As colunas n informam os denominadores válidos. Clique no cabeçalho para ordenar.',`<div class="table-tools"><label class="sr-only" for="table-group">Agrupamento da tabela</label>${choice('table-group',dimensions,tableKey)}<label class="sr-only" for="table-search">Buscar grupo</label><input id="table-search" placeholder="Buscar grupo…" value="${esc(tableSearch)}"></div><div class="table-wrap" id="table-body"></div>`);
}
function tableData(rows){
 return groups(rows,tableKey).map(g=>{
  const s=M.summary(g.items);
  return {name:g.name,n:g.n,age:s.age.mean,extra:s.extra.total,extraMean:s.extra.mean,accidents:s.accidents.total,rate:s.accidents.rate,target:s.goals.mean,salary:s.salary.total,salaryMean:s.salary.mean,salaryMedian:s.salary.median,nSalary:s.salary.n,nGoals:s.goals.n,nAccidents:s.accidents.n,nAge:s.age.n,nExtra:s.extra.n};
 }).filter(g=>g.name.toLocaleLowerCase('pt-BR').includes(tableSearch.toLocaleLowerCase('pt-BR'))).sort((a,b)=>{
  const x=a[tableSort],y=b[tableSort];
  if(x===null||y===null)return (x===null)-(y===null)||a.name.localeCompare(b.name,'pt-BR');
  return tableDirection*(typeof x==='string'?x.localeCompare(y,'pt-BR'):x-y)||a.name.localeCompare(b.name,'pt-BR');
 });
}
const columns=[['name','Grupo'],['n','Pessoas'],['age','Idade média'],['extra','Extras (h)'],['extraMean','Extras/pessoa (h)'],['accidents','Acidentes (n)'],['rate','Ocorrências/100 com informação'],['target','Meta média (%)'],['salary','Folha ativos (R$)'],['salaryMean','Salário médio ativos (R$)'],['salaryMedian','Mediana ativos (R$)'],['nSalary','n salários ativos'],['nGoals','n metas'],['nAccidents','n registros de acidentes'],['nAge','n idades'],['nExtra','n horas extras']];
function updateTable(){
 const data=tableData(selected());
 $('table-body').innerHTML=`<table><caption class="sr-only">Resumo agregado por ${tableKey}. As colunas n informam os registros com valores válidos de cada indicador.</caption><thead><tr>${columns.map(([k,l])=>`<th scope="col" aria-sort="${tableSort===k?(tableDirection===1?'ascending':'descending'):'none'}"><button data-sort="${k}">${l} ${tableSort===k?(tableDirection===1?'↑':'↓'):'↕'}</button></th>`).join('')}</tr></thead><tbody>${data.map(g=>`<tr>${columns.map(([k])=>`<td>${k==='name'?esc(g[k]):['salary','salaryMean','salaryMedian'].includes(k)?money(g[k],k==='salary'?0:2):fmt(g[k],['age','extraMean','rate','target'].includes(k)?1:0)}</td>`).join('')}</tr>`).join('')}</tbody></table>${data.length?'':'<p class="empty">Nenhum grupo encontrado.</p>'}`;
 document.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{tableDirection=tableSort===b.dataset.sort?-tableDirection:-1;tableSort=b.dataset.sort;updateTable()});
}
function method(){return panel('Como interpretar os indicadores','Fonte: planilha de RH Enterprise fornecida para este portfólio.',`<div class="method-copy"><p>Os 100 registros são fictícios, conforme informado pelo autor. A base reúne atributos de pessoas, admissões entre 2014 e 2023 e desligamentos entre 2023 e 2024. A competência de salários, metas, horas extras e acidentes não foi informada. O painel não atribui esses indicadores a um mês ou ano específico.</p><h3>Definições e denominadores</h3><ul><li><strong>Colaboradores ativos:</strong> contagem de registros com Status = Ativo, respeitando os filtros.</li><li><strong>Folha base mensal:</strong> soma do salário base dos ativos. Não inclui bônus, benefícios, encargos ou custo de horas extras.</li><li><strong>Meta ≥ 100%:</strong> pessoas com atingimento válido maior ou igual a 100 dividido pelo número de pessoas com meta válida. Meta média é outro indicador: média aritmética do percentual individual.</li><li><strong>Ocorrências por 100 pessoas:</strong> soma de acidentes válidos ÷ pessoas com informação válida de acidentes × 100. Não é percentual de acidentados, nem taxa de frequência por horas de exposição. O período dos acidentes não consta na base.</li><li><strong>Horas extras:</strong> soma de horas no mês registrado, cuja competência não foi informada. A média divide essa soma pelas pessoas com horas válidas.</li><li><strong>Idade média:</strong> média aritmética das idades válidas registradas, sem atualização pelo calendário.</li><li><strong>Bônus anual:</strong> soma dos bônus dos ativos. Não é somado diretamente à folha mensal.</li><li><strong>Desligamentos:</strong> contagem dos registros desligados no histórico disponível. Participação entre os registros não representa turnover.</li></ul><h3>Limites e próximos dados necessários</h3><p>A linha histórica reconstrói somente as pessoas presentes na amostra; não comprova o quadro histórico completo. Para calcular turnover por período, obter o quadro inicial e final completo, as admissões e os desligamentos do mesmo período. Para evoluções de folha, metas e horas extras, incluir snapshots mensais. Para frequência de acidentes, incluir horas de exposição e datas das ocorrências. Para análise salarial comparável, considerar cargo, nível e jornada, além de gênero e etnia.</p><p>Os filtros globais afetam os gráficos, cartões, texto e tabelas. O filtro de status usa o status atual registrado, inclusive na reconstrução histórica. A busca da tabela afeta apenas a tabela e o CSV. O CSV exporta o agrupamento e a ordenação escolhidos.</p></div>`);}
const titles={overview:['Pessoas em perspectiva.','Uma visão integrada de equipe, resultados e bem-estar.'],people:['Diversidade que se enxerga.','Composição da equipe, distribuição etária e modelos de trabalho.'],performance:['Resultados & investimento.','Metas, remuneração e esforço das equipes no recorte disponível.'],safety:['Um olhar para a segurança.','Ocorrências e tamanho das equipes, lado a lado.'],departures:['Entender as saídas.','Motivos e distribuição dos desligamentos registrados na base.'],method:['Dados com contexto.','Definições, tratamento e limites para uma leitura transparente.']};
function render(){
 const rows=selected();$('scope').textContent=`${rows.length} de ${DATA.length} registros`;
 $('page-title').textContent=titles[tab][0];$('page-subtitle').textContent=titles[tab][1];
 document.querySelectorAll('[data-tab]').forEach(b=>{b.removeAttribute('aria-current');if(b.dataset.tab===tab)b.setAttribute('aria-current','page')});
 persistentSummary(rows);
 let html='';const base=kpis(rows),active=rows.filter(r=>r.Status==='Ativo');
 if(tab==='overview')html=base+
  panel('Como a equipe se formou','Acompanhe as entradas e saídas presentes no histórico da base.',`<div id="timeline">${timeline(rows,chartState.timeline)}</div>`,choice('timeline-mode',[['headcount','Quadro no fim do ano'],['movement','Admissões × desligamentos']],chartState.timeline))+
  featuredSummary(rows)+`<div class="grid overview-layout">${panel('Onde estão as pessoas','Conheça o tamanho de cada equipe.',bars(rows,'Departamento'))}<div class="side-stack">${panel('Vínculos na base','Pessoas ativas e saídas registradas no histórico.',donut(rows,'Status'))}${panel('Como as equipes trabalham','A presença dos modelos presencial, híbrido e remoto.',donut(rows,'Modelo_Trabalho'))}</div></div>`+
  `<div class="grid equal">${panel('Gerações na equipe','Veja como as pessoas se distribuem por idade.',ageDistribution(rows))}${panel('Metas em perspectiva','Quantas pessoas estão em cada faixa de atingimento.',targetDistribution(rows))}</div>`+
  `<div class="grid equal">${panel('Diversidade de gênero','A composição de gênero das pessoas selecionadas.',donut(rows,'Genero'))}${panel('Diversidade étnica','Uma leitura da autodeclaração registrada na base.',donut(rows,'Etnia'))}</div>`+
  `<div class="grid equal">${panel('Onde se concentram as horas extras','Total de horas registrado em cada departamento.',bars(rows,'Departamento','extraTotal'))}${panel('Segurança por equipe','Ocorrências por 100 pessoas com informação válida de acidentes.',bars(rows,'Departamento','accident'))}</div>`;
 if(tab==='people')html=base+miniFacts(rows,'people')+
  `<div class="grid thirds">${panel('Gênero','Quem compõe a equipe selecionada.',donut(rows,'Genero'))}${panel('Etnia','As diferentes autodeclarações da nossa base.',donut(rows,'Etnia'))}${panel('Modelo de trabalho','Como as pessoas se conectam ao trabalho.',donut(rows,'Modelo_Trabalho'))}</div>`+
  panel('Diversidade dentro das equipes','Compare a participação de cada gênero entre departamentos.',departmentStack(rows,'Genero'))+
  `<div class="grid equal">${panel('Gerações na equipe','A distribuição das pessoas em faixas de idade.',ageDistribution(rows))}${panel('Presença pelo Brasil','Pessoas em cada estado de alocação.',bars(rows,'UF_Alocacao'))}</div>`+
  `<div class="grid equal">${panel('Idade média por cargo','Os 12 cargos com maior idade média. Veja todos na tabela.',bars(rows,'Cargo','age',12))}${panel('Idade média por departamento','Compare o perfil etário das equipes.',bars(rows,'Departamento','age'))}</div>`+
  panel('Modelos de trabalho por equipe','A combinação de presencial, híbrido e remoto em cada área.',departmentStack(rows,'Modelo_Trabalho'))+
  `<div class="grid equal">${panel('Senioridade na base','Distribuição pelo nível de cargo registrado. Não representa tempo de empresa.',donut(rows,'Nivel_Cargo'))}${panel('Distribuição por cargo','Os 12 cargos com mais registros. Todos os cargos estão na tabela.',bars(rows,'Cargo','count',12))}</div>`;
 if(tab==='performance')html=base+remunerationSummary(rows)+
  `<div class="grid equal">${panel('Remuneração por departamento','Média e mediana do salário base dos ativos. Valores sem ajuste por cargo, nível ou jornada.',salaryComparison(rows,'Departamento'))}${panel('Remuneração por cargo','Até 12 cargos com maior salário médio entre ativos. Todos os grupos estão na tabela.',salaryComparison(rows,'Cargo',12))}</div>`+
  panel('Esforço & atingimento de metas','Explore a relação entre horas extras e resultados por departamento.',bubbles(rows))+
  `<div class="grid equal">${panel('Metas por departamento','Como as equipes se posicionam no atingimento médio.',bars(rows,'Departamento','target'))}${panel('O alcance das metas','A distribuição das pessoas por faixa de resultado.',targetDistribution(rows))}</div>`+
  panel('Um mapa dos resultados','Identifique a concentração das faixas de metas dentro de cada equipe.',targetHeatmap(rows))+
  `<div class="grid equal">${panel('Horas extras por pessoa','O esforço adicional médio em cada departamento.',bars(rows,'Departamento','extra'))}${panel('Investimento em salários','A distribuição da folha base mensal entre as equipes ativas.',bars(active,'Departamento','salaryTotal'))}</div>`+
  `<div class="grid equal">${panel('Faixas de remuneração','Pessoas ativas em cada faixa de salário base mensal.',salaryDistribution(rows))}${panel('Bônus anual por departamento','Valores anuais informados para os colaboradores ativos.',bonusByDepartment(active))}</div>`+
  panel('Sobre esta comparação','Como interpretar salários e bônus.',`<p class="caption">Os salários representam o salário base mensal registrado dos ativos. O bônus é anual e permanece separado da folha. Cada média e mediana usa somente salários válidos; grupos sem informação não recebem barras. Diferenças entre grupos não demonstram desigualdade salarial ajustada.</p>`);
 if(tab==='safety')html=base+miniFacts(rows,'safety')+
  panel('Acidentes em contexto','Compare as ocorrências considerando o tamanho dos grupos.',`<div id="safety-bars">${bars(rows,chartState.safety,'accident')}</div><p class="caption">Ocorrências por 100 registros com informação válida. As ausências são excluídas; consulte os denominadores na tabela.</p>`,choice('group',dimensions,chartState.safety))+
  `<div class="grid equal">${panel('Ocorrências por estado','Onde foram registrados os acidentes de trabalho.',accidentCounts(rows,'UF_Alocacao'))}${panel('Ocorrências por cargo','As funções com registros de acidentes de trabalho.',accidentCounts(rows,'Cargo'))}</div>`+
  `<div class="grid equal">${panel('Horas extras por departamento','Observe o esforço adicional das equipes no mesmo recorte.',bars(rows,'Departamento','extraTotal'))}${panel('Pessoas com e sem ocorrências','Cada pessoa entra uma vez, independentemente do número de acidentes.',incidentDonut(rows))}</div>`+
  `<div class="notice">O período dos acidentes e as horas de exposição não constam na base. A visualização não permite concluir que horas extras causaram acidentes.</div>`;
 if(tab==='departures'){
  const exits=rows.filter(r=>r.Status==='Desligado');
  html=base+miniFacts(rows,'departures')+`<div class="grid equal">${panel('Por que as pessoas saíram','Os motivos informados nos desligamentos registrados.',bars(exits,'Motivo_Desligamento'))}${panel('Como ocorreram as saídas','A participação dos desligamentos voluntários e involuntários.',donut(exits,'Tipo_Desligamento'))}</div>`+
   panel('Quando aconteceram as saídas','A distribuição mensal dos desligamentos com data informada.',monthDepartures(rows))+
   `<div class="grid equal">${panel('Saídas por departamento','As equipes de origem das pessoas desligadas.',bars(exits,'Departamento'))}${panel('Saídas por estado','Onde estavam alocadas as pessoas que saíram.',bars(exits,'UF_Alocacao'))}</div>`+
   `<div class="grid equal">${panel('Perfil etário das saídas','As faixas de idade dos desligamentos registrados.',ageDistribution(exits))}${panel('Modelo de trabalho nas saídas','A composição dos modelos de trabalho entre as pessoas desligadas.',donut(exits,'Modelo_Trabalho'))}</div>`+
   `<div class="notice">As saídas são contagens do histórico disponível. O quadro completo por período é necessário para calcular turnover.</div>`;
 }
 if(tab==='method')html=method()+metricMethod();
 $('content').innerHTML=html+(tab==='method'?'':table(rows));
 if($('timeline-mode'))$('timeline-mode').onchange=()=>{chartState.timeline=$('timeline-mode').value;$('timeline').innerHTML=timeline(selected(),chartState.timeline);activateVisuals()};
 if($('group'))$('group').onchange=()=>{chartState.safety=$('group').value;$('safety-bars').innerHTML=bars(selected(),chartState.safety,'accident');activateVisuals()};
 if($('table-group')){$('table-group').onchange=()=>{tableKey=$('table-group').value;updateTable()};$('table-search').oninput=()=>{tableSearch=$('table-search').value;updateTable()};updateTable()}
 compactPanels();updateInsights(rows,tab);activateVisuals();
}

document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
$('reset').onclick=()=>{Object.keys(filters).forEach(id=>$(id).value='');tableSearch='';render()};
$('export').onclick=()=>{
 const data=tableData(selected());
 const quote=s=>'"'+String(s).replaceAll('"','""')+'"';
 const csv='\uFEFF'+[columns.map(c=>quote(c[1])).join(';'),...data.map(r=>columns.map(([k])=>quote(typeof r[k]==='number'?String(Math.round(r[k]*100)/100).replace('.',','):r[k]??'')).join(';'))].join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='rh-solutionsx-resumo.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
render();
