// Visualizações complementares. Todos os cálculos respeitam os filtros globais.
function categoryChart(items,unit='pessoas',tone='#3b7d9c'){
 if(!items.length||!items.some(i=>i.value>0))return '<p class="empty">Não há valores para exibir neste recorte.</p>';
 const max=Math.max(...items.map(i=>i.value),1),top=Math.ceil(max/4)*4;
 const w=680,h=270,left=52,plot=600,step=plot/items.length;
 return `<div class="chart-scroll"><svg class="chart category-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(items.map(i=>i.name+': '+fmt(i.value,1)+' '+unit).join('; '))}"><text x="${left}" y="18">${esc(unit)}</text>${Array.from({length:5},(_,i)=>{const y=210-i/4*160;return `<line x1="${left}" x2="650" y1="${y}" y2="${y}" stroke="#e6e8e4"/><text x="42" y="${y+4}" text-anchor="end">${fmt(top*i/4)}</text>`}).join('')}${items.map((i,k)=>{const bh=i.value/top*160,x=left+k*step+step*.23;return `<g class="chart-point" tabindex="0" data-tip="${esc(i.name+': '+fmt(i.value,1)+' '+unit)}" aria-label="${esc(i.name+': '+fmt(i.value,1)+' '+unit)}"><rect class="column-bar" x="${x}" y="${210-bh}" width="${step*.54}" height="${bh}" rx="5" fill="${i.color||tone}"/><text x="${x+step*.27}" y="${199-bh}" text-anchor="middle" class="value-label">${fmt(i.value,i.decimals||0)}</text><text x="${x+step*.27}" y="234" text-anchor="middle">${esc(i.name)}</text><title>${esc(i.name)}: ${fmt(i.value,1)} ${esc(unit)}</title></g>`}).join('')}<text x="650" y="263" text-anchor="end">${esc(items.axis||'Grupos')}</text></svg></div>`;
}
function ageDistribution(rows){
 const bands=[['Até 24',a=>a<=24],['25–34',a=>a>=25&&a<=34],['35–44',a=>a>=35&&a<=44],['45+',a=>a>=45]];
 const data=bands.map(([name,fn])=>({name,value:rows.filter(r=>fn(r.Idade)).length}));data.axis='Faixa etária (anos)';return categoryChart(data);
}
function targetDistribution(rows){
 const data=[{name:'Abaixo de 80%',value:rows.filter(r=>r.Meta_Atingida_Pct<80).length,color:'#b28a55'},{name:'80 a <100%',value:rows.filter(r=>r.Meta_Atingida_Pct>=80&&r.Meta_Atingida_Pct<100).length,color:'#91a4aa'},{name:'100 a <110%',value:rows.filter(r=>r.Meta_Atingida_Pct>=100&&r.Meta_Atingida_Pct<110).length,color:'#3b7d9c'},{name:'110% ou mais',value:rows.filter(r=>r.Meta_Atingida_Pct>=110).length,color:'#183e55'}];data.axis='Atingimento da meta';return categoryChart(data);
}
function salaryDistribution(rows){
 const active=rows.filter(r=>r.Status==='Ativo');
 const data=[['Até R$ 5 mil',s=>s<=5000],['5 a 10 mil',s=>s>5000&&s<=10000],['10 a 15 mil',s=>s>10000&&s<=15000],['Acima de 15 mil',s=>s>15000]].map(([name,fn])=>({name,value:active.filter(r=>fn(r.Salario_Base)).length}));data.axis='Faixa de salário base mensal (R$)';return categoryChart(data);
}
function departmentStack(rows,field='Genero'){
 if(!rows.length)return '<p class="empty">Nenhum registro para este recorte.</p>';
 const categories=[...new Set(rows.map(r=>r[field]))].sort();
 const gs=groups(rows,'Departamento').sort((a,b)=>b.n-a.n);
 return `<div class="stacked-list">${gs.map(g=>`<div class="stacked-row"><span>${esc(g.name)}<small>${g.n} pessoas</small></span><div class="stacked-track">${categories.map((name,i)=>{const n=g.items.filter(r=>r[field]===name).length;return n?`<div class="stack-segment chart-point" tabindex="0" role="img" aria-label="${esc(g.name+' · '+name+': '+n+' pessoas')}" data-tip="${esc(g.name+' · '+name+': '+n+' pessoas ('+fmt(n/g.n*100,1)+'%)')}" style="width:${n/g.n*100}%;background:${colors[i%colors.length]}">${n/g.n>=.14?fmt(n/g.n*100)+'%':''}</div>`:''}).join('')}</div></div>`).join('')}</div><div class="legend">${categories.map((name,i)=>`<span><i style="background:${colors[i%colors.length]}"></i>${esc(name)}</span>`).join('')}</div><p class="caption">Cada faixa representa a composição de uma equipe. O tamanho da equipe aparece ao lado do nome.</p>`;
}
function targetHeatmap(rows){
 if(!rows.length)return '<p class="empty">Nenhum registro para este recorte.</p>';
 const bands=[['<80%',v=>v<80],['80–<100%',v=>v>=80&&v<100],['100–<110%',v=>v>=100&&v<110],['≥110%',v=>v>=110]];
 const gs=groups(rows,'Departamento').sort((a,b)=>a.name.localeCompare(b.name));
 const max=Math.max(1,...gs.flatMap(g=>bands.map(([,fn])=>g.items.filter(r=>fn(r.Meta_Atingida_Pct)).length)));
 return `<div class="heatmap-scroll"><table class="heatmap"><caption class="sr-only">Pessoas por departamento e faixa de atingimento da meta</caption><thead><tr><th>Departamento</th>${bands.map(([name])=>`<th>${name}</th>`).join('')}</tr></thead><tbody>${gs.map(g=>`<tr><td>${esc(g.name)}<small>${g.n} pessoas</small></td>${bands.map(([name,fn])=>{const n=g.items.filter(r=>fn(r.Meta_Atingida_Pct)).length;return `<td style="--intensity:${n/max}"><span class="heat-cell chart-point" tabindex="0" data-tip="${esc(g.name+' · '+name+': '+n+' pessoas')}" style="background:rgba(59,125,156,${.05+n/max*.8});color:${n/max>.55?'white':'#284454'}">${n}</span></td>`}).join('')}</tr>`).join('')}</tbody></table></div><p class="caption">Número de pessoas em cada faixa. Quanto mais escura a célula, maior a quantidade.</p>`;
}
function monthDepartures(rows){
 const exits=rows.filter(r=>r.Status==='Desligado'&&r.Data_Desligamento);
 const periods=[...new Set(DATA.filter(r=>r.Data_Desligamento).map(r=>r.Data_Desligamento.slice(0,7)))].sort();
 const data=periods.map(p=>({name:p.slice(5)+'/'+p.slice(2,4),value:exits.filter(r=>r.Data_Desligamento.startsWith(p)).length}));data.axis='Mês/ano do desligamento';return categoryChart(data,'desligamentos','#b28a55');
}
function featuredSummary(rows){
 const active=rows.filter(r=>r.Status==='Ativo'),largest=groups(rows,'Departamento').sort((a,b)=>b.n-a.n)[0];
 const extra=groups(rows,'Departamento').sort((a,b)=>sum(b.items,'Horas_Extra_Mes')-sum(a.items,'Horas_Extra_Mes'))[0];
 const incidents=groups(rows,'Departamento').filter(g=>sum(g.items,'Acidentes_Trabalho')>0).sort((a,b)=>sum(b.items,'Acidentes_Trabalho')-sum(a.items,'Acidentes_Trabalho'))[0];
 if(!rows.length)return '';
 const met=rows.filter(r=>r.Meta_Atingida_Pct>=100).length;
 return `<section class="feature-summary"><div class="feature-story"><p class="eyebrow">Panorama executivo</p><h2>Uma equipe. Muitas perspectivas.</h2><p>${rows.length} pessoas na base selecionada, distribuídas em ${groups(rows,'Departamento').length} áreas e ${groups(rows,'UF_Alocacao').length} unidades da federação. Explore a composição da equipe e os sinais que merecem atenção.</p><div class="feature-tags"><span>${active.length} ativos</span><span>${rows.length-active.length} desligados no histórico</span></div></div><div class="feature-findings"><article><span class="finding-index">01</span><div><h3>A maior equipe</h3><strong>${esc(largest.name)}</strong><p>${largest.n} pessoas representam ${fmt(largest.n/rows.length*100,1)}% do recorte.</p></div></article><article><span class="finding-index">02</span><div><h3>Metas alcançadas</h3><strong>${met} pessoas atingiram a meta</strong><p>${rows.length-met} ficaram abaixo de 100% de atingimento.</p></div></article><article><span class="finding-index">03</span><div><h3>${incidents?'Segurança em foco':'Horas extras em foco'}</h3><strong>${esc((incidents||extra).name)}</strong><p>${incidents?`${sum(incidents.items,'Acidentes_Trabalho')} ocorrências registradas em uma equipe de ${incidents.n} pessoas.`:`${sum(extra.items,'Horas_Extra_Mes')} horas extras registradas nesta equipe.`}</p></div></article></div></section>`;
}
function persistentSummary(rows){
 const active=rows.filter(r=>r.Status==='Ativo'),met=rows.filter(r=>r.Meta_Atingida_Pct>=100).length;
 const parts=[['Ativos',fmt(active.length)],['Folha mensal',money(sum(active,'Salario_Base'))],['Meta alcançada',rows.length?fmt(met/rows.length*100,1)+'%':'—'],['Horas extras',fmt(sum(rows,'Horas_Extra_Mes'))+' h'],['Acidentes',fmt(sum(rows,'Acidentes_Trabalho'))]];
 $('persistent-summary').innerHTML=`<span class="summary-label"><i></i>Resumo do recorte</span>${parts.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('')}`;
}
function simpleRanking(items,unit=''){
 if(!items.length)return '<p class="empty">Não há ocorrências neste recorte.</p>';
 const max=Math.max(...items.map(i=>i.value),1);
 return items.sort((a,b)=>b.value-a.value).map(i=>`<div class="bar-row"><span class="bar-label">${esc(i.name)}<small>${esc(i.detail||'')}</small></span><div class="track"><div class="fill" style="width:${i.value/max*100}%"></div></div><span class="bar-value">${unit==='R$'?money(i.value):fmt(i.value)+unit}</span></div>`).join('');
}
function bonusByDepartment(rows){return simpleRanking(groups(rows,'Departamento').map(g=>({name:g.name,value:sum(g.items,'Bonus_Anual_RS'),detail:g.n+' pessoas ativas'})),'R$')}
function accidentCounts(rows,key){return simpleRanking(groups(rows,key).map(g=>({name:g.name,value:sum(g.items,'Acidentes_Trabalho'),detail:g.n+' pessoas no grupo'})).filter(g=>g.value>0),' ocorr.')}
function incidentDonut(rows){return donut(rows.map(r=>({...r,incident:r.Acidentes_Trabalho>0?'Com ocorrência':'Sem ocorrência'})),'incident')}
function updateInsights(rows,section){
 if(!rows.length){$('insights').innerHTML='<p>Nenhuma pessoa corresponde à combinação de filtros. Limpe os filtros para retomar a análise.</p>';return}
 const active=rows.filter(r=>r.Status==='Ativo'),departments=groups(rows,'Departamento');
 const largest=departments.slice().sort((a,b)=>b.n-a.n)[0];
 const extra=departments.slice().sort((a,b)=>sum(b.items,'Horas_Extra_Mes')-sum(a.items,'Horas_Extra_Mes'))[0];
 const best=departments.slice().sort((a,b)=>mean(b.items,'Meta_Atingida_Pct')-mean(a.items,'Meta_Atingida_Pct'))[0];
 const exits=rows.filter(r=>r.Status==='Desligado');
 const incident=departments.filter(g=>sum(g.items,'Acidentes_Trabalho')>0).sort((a,b)=>sum(b.items,'Acidentes_Trabalho')-sum(a.items,'Acidentes_Trabalho'))[0];
 let paragraphs=[];
 if(section==='overview'||section==='method')paragraphs=[`A RH SolutionsX apresenta <strong>${rows.length} pessoas</strong> neste recorte, sendo <strong>${active.length} ativas</strong>. A folha base mensal dos ativos soma <strong>${money(sum(active,'Salario_Base'))}</strong>. ${esc(largest.name)} é a maior equipe, com ${largest.n} pessoas.`,`${rows.filter(r=>r.Meta_Atingida_Pct>=100).length} pessoas alcançaram pelo menos 100% da meta. As horas extras somam <strong>${fmt(sum(rows,'Horas_Extra_Mes'))} h</strong>, e ${esc(extra.name)} concentra o maior volume (${sum(extra.items,'Horas_Extra_Mes')} h). A base registra ${sum(rows,'Acidentes_Trabalho')} ocorrências de acidentes.`];
 if(section==='people')paragraphs=[`O recorte reúne <strong>${groups(rows,'Genero').length} categorias de gênero</strong> e <strong>${groups(rows,'Etnia').length} autodeclarações étnicas</strong>. As pessoas estão distribuídas em ${groups(rows,'UF_Alocacao').length} estados e ${groups(rows,'Cargo').length} cargos.`,`A idade média é de <strong>${fmt(mean(rows,'Idade'),1)} anos</strong>. Use a composição por departamento para observar onde a participação dos grupos difere. Essa distribuição, isoladamente, não mede inclusão ou igualdade de oportunidades.`];
 if(section==='performance')paragraphs=[`O atingimento médio das metas é de <strong>${fmt(mean(rows,'Meta_Atingida_Pct'),1)}%</strong>. ${esc(best.name)} tem a maior média neste recorte (${fmt(mean(best.items,'Meta_Atingida_Pct'),1)}%, entre ${best.n} pessoas).`,`${esc(extra.name)} registra ${sum(extra.items,'Horas_Extra_Mes')} horas extras no total. A folha mensal dos ativos soma ${money(sum(active,'Salario_Base'))}, enquanto o bônus anual informado soma ${money(sum(active,'Bonus_Anual_RS'))}. Compare cargo e nível antes de interpretar diferenças salariais.`];
 if(section==='safety')paragraphs=[`Foram registradas <strong>${sum(rows,'Acidentes_Trabalho')} ocorrências</strong>, envolvendo ${rows.filter(r=>r.Acidentes_Trabalho>0).length} pessoas com pelo menos um registro. ${incident?`${esc(incident.name)} concentra ${sum(incident.items,'Acidentes_Trabalho')} ocorrências em um grupo de ${incident.n} pessoas.`:'Não há ocorrências no recorte selecionado.'}`,`As contagens ajudam a escolher os grupos a investigar. Para comparar risco de exposição, ainda são necessárias as datas das ocorrências e as horas trabalhadas por equipe.`];
 if(section==='departures'){const reason=groups(exits,'Motivo_Desligamento').sort((a,b)=>b.n-a.n)[0];paragraphs=[`O histórico selecionado reúne <strong>${exits.length} desligamentos</strong>. ${reason?`${esc(reason.name)} é o motivo mais frequente, presente em ${reason.n} registros.`:'Não há desligamentos para os filtros atuais.'}`,`A leitura por mês, departamento e modelo de trabalho descreve as saídas disponíveis. Para calcular turnover e avaliar uma tendência, é necessário conhecer o quadro completo de cada período.`]}
 $('insights').innerHTML=paragraphs.map(p=>`<p>${p}</p>`).join('')+'<p class="insight-note">Dados fictícios. A competência de salários, metas, horas extras e acidentes não foi informada.</p>';
}
function miniFacts(rows,kind){
 const active=rows.filter(r=>r.Status==='Ativo');let facts=[];
 if(kind==='people')facts=[['UFs',groups(rows,'UF_Alocacao').length,'Presença geográfica'],['Cargos',groups(rows,'Cargo').length,'Funções na base selecionada'],['Departamentos',groups(rows,'Departamento').length,'Áreas representadas']];
 if(kind==='safety')facts=[['Pessoas com ocorrência',rows.filter(r=>r.Acidentes_Trabalho>0).length,'Pelo menos um acidente registrado'],['Equipes com ocorrência',groups(rows,'Departamento').filter(g=>sum(g.items,'Acidentes_Trabalho')>0).length,'Áreas que concentram os registros'],['Ocorrências por 100 pessoas',rows.length?fmt(sum(rows,'Acidentes_Trabalho')/rows.length*100,1):'—','Indicador sem período de referência']];
 if(kind==='departures'){const exits=rows.filter(r=>r.Status==='Desligado');facts=[['Saídas registradas',exits.length,'Histórico disponível'],['Voluntárias',exits.filter(r=>r.Tipo_Desligamento==='Voluntario').length,'Classificação informada na base'],['Involuntárias',exits.filter(r=>r.Tipo_Desligamento==='Involuntario').length,'Classificação informada na base']];}
 return `<div class="mini-facts">${facts.map(([label,value,caption])=>`<article><span>${label}</span><strong>${value}</strong><small>${caption}</small></article>`).join('')}</div>`;
}
let animationObserver;
function compactPanels(){
 const container=$('content');
 for(const group of [...container.querySelectorAll(':scope > .grid.equal')]){
  if(!group.isConnected)continue;
  const masonry=document.createElement('div');masonry.className='masonry-panels';container.insertBefore(masonry,group);
  let next=group;
  while(next?.matches('.grid.equal')){const following=next.nextElementSibling;while(next.firstChild)masonry.appendChild(next.firstChild);next.remove();next=following}
 }
}
function activateVisuals(){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('print').matches;
 animationObserver?.disconnect();
 if(!reduce){
  animationObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');animationObserver.unobserve(e.target)}}),{threshold:.06});
  document.querySelectorAll('#content .panel,#content .feature-summary,#content .mini-facts').forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',`${Math.min(i%3*60,120)}ms`);animationObserver.observe(el)});
  document.querySelectorAll('.kpi').forEach((el,i)=>el.animate([{opacity:.3,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,delay:i*45,fill:'backwards',easing:'ease-out'}));
 }
 const tooltip=$('chart-tooltip');tooltip.hidden=true;
 const hide=()=>{tooltip.hidden=true};
 document.querySelectorAll('.chart-point,.bubble,.bar-row').forEach(el=>{
  const text=el.dataset.tip||el.getAttribute('aria-label')||el.innerText?.replaceAll('\n',' · ');
  if(!text)return;
  const show=e=>{tooltip.textContent=text;tooltip.hidden=false;const b=el.getBoundingClientRect();const x=e.clientX||b.x+b.width/2,y=e.clientY||b.y;tooltip.style.left=Math.max(8,Math.min(x,innerWidth-tooltip.offsetWidth-12))+'px';tooltip.style.top=Math.max(8,Math.min(y+18,innerHeight-tooltip.offsetHeight-12))+'px'};
  el.addEventListener('pointerenter',show);el.addEventListener('pointermove',show);el.addEventListener('pointerleave',hide);el.addEventListener('focus',show);el.addEventListener('blur',hide);
 });
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('chart-tooltip'))document.getElementById('chart-tooltip').hidden=true});
document.addEventListener('DOMContentLoaded',()=>{const nav=document.querySelector('nav');new ResizeObserver(()=>document.documentElement.style.setProperty('--nav-height',nav.offsetHeight+'px')).observe(nav)});
window.addEventListener('beforeprint',()=>{document.getAnimations().forEach(a=>a.finish());document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'))});
