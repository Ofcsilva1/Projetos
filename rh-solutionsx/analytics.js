// Apresentação analítica da Fase 3; não modifica DATA.
function coverageNote(total, known, label) {
 return known < total ? `<p class="metric-note">${known} de ${total} registros com ${esc(label)} válido. ${total-known} sem informação válida foram excluídos deste indicador.</p>` : '';
}
function remunerationSummary(rows) {
 const s=M.summary(rows);
 return panel('Remuneração dos ativos','Salário base mensal e bônus anual, apresentados separadamente.',
  `<div class="mini-facts salary-facts">
   <article><span>Salário base médio</span><strong data-metric="salary-mean">${money(s.salary.mean,2)}</strong><small>${s.salary.n} salários válidos entre ${s.active} ativos</small></article>
   <article><span>Mediana salarial</span><strong data-metric="salary-median">${money(s.salary.median,2)}</strong><small>Valor central dos ${s.salary.n} salários válidos ordenados</small></article>
   <article><span>Bônus anual dos ativos</span><strong data-metric="bonus-total">${money(s.bonus.total)}</strong><small>${s.bonus.n} bônus informados · ano não informado</small></article>
  </div>`+coverageNote(s.active,s.salary.n,'salário dos ativos')+
  '<p class="caption">A média considera todos os salários válidos do recorte; não é a média das médias dos departamentos. Comparações sem ajuste por cargo, nível ou jornada.</p>');
}
function salaryComparison(rows, field, limit=100) {
 const active=rows.filter(r=>r.Status==='Ativo');
 if(!active.length)return '<p class="empty">Nenhum colaborador ativo neste recorte.</p>';
 const all=groups(active,field).map(g=>({...g,stats:M.stats(g.items,'Salario_Base')}))
  .sort((a,b)=>(a.stats.mean===null)-(b.stats.mean===null)||(b.stats.mean??0)-(a.stats.mean??0)||a.name.localeCompare(b.name,'pt-BR'));
 const jobs=field==='Cargo',id=jobs?'salary-jobs':'salary-departments';
 const max=Math.max(1,...all.flatMap(g=>[g.stats.mean??0,g.stats.median??0]));
 const items=all.slice(0,limit);
 const markup=g=>{
  const single=jobs&&g.stats.n===1,stats=g.stats,known=stats.n>0;
  const text=single?`${g.name}: salário ${money(stats.mean,2)}, ${g.n} ${g.n===1?'pessoa':'pessoas'}, ${stats.n} salário válido`:`${g.name}: média ${money(stats.mean,2)}; mediana ${money(stats.median,2)}; ${stats.n} salários válidos / ${g.n} ativos. Diferença absoluta ${known?money(Math.abs(stats.mean-stats.median),2):'indisponível'}, sem inferência de causa.`;
  const mean=known?stats.mean/max*100:0,median=known?stats.median/max*100:0;
  return `<div class="salary-compare-row" data-salary-name="${esc(g.name)}"><button type="button" class="salary-series chart-point ${single?'single-salary':'paired-salary'}" ${selectionAttrs(field,g.name)} data-tip="${esc(text)}" aria-label="${esc('Filtrar '+text)}"><span class="salary-group"><strong>${esc(g.name)}</strong><small>${g.n===1?'1 pessoa':g.n+' ativos'} · ${stats.n} ${stats.n===1?'salário válido':'salários válidos'}</small></span><span class="salary-plot" aria-hidden="true">${known?`<span class="salary-connector" style="left:${Math.min(mean,median)}%;width:${Math.abs(mean-median)}%"></span><i class="salary-dot mean" style="left:${mean}%"></i>${single?'':`<i class="salary-dot median" style="left:${median}%"></i>`}`:'<span class="caption">Sem informação</span>'}</span><span class="salary-values"><strong>${money(stats.mean,2)}</strong>${single?'<small>Salário registrado</small>':`<small>Mediana ${money(stats.median,2)}</small>`}</span></button></div>`;
 };
 return `<div class="salary-controls">${jobs?`<label>Buscar cargo<input type="search" id="salary-search" name="salary-search" autocomplete="off" maxlength="120" placeholder="Nome do cargo…"></label><label>Exibir<select id="salary-limit" name="salary-limit"><option value="12">Top 12</option><option value="24">Top 24</option><option value="all">Todos (${all.length})</option></select></label>`:''}<div class="salary-legend"><span><i class="mean"></i>${jobs&&all.every(g=>g.stats.n<=1)?'Salário registrado':jobs?'Salário / média':'Média'}</span>${!jobs||all.some(g=>g.stats.n>1)?'<span><i class="median"></i>Mediana</span>':''}</div></div><div class="salary-axis" aria-hidden="true"><span>R$ 0</span><span>${money(max,0)}</span></div><div class="salary-comparison rank-scroll" id="${id}" tabindex="0" role="region" aria-label="Remuneração por ${jobs?'cargo':'departamento'}, com rolagem">${items.map(markup).join('')}</div><p class="caption salary-count" id="${id}-count">${jobs?'Exibindo '+items.length+' de '+all.length+' cargos. Busque um cargo ou escolha Todos; todos os grupos também estão na tabela.':'Pontos na mesma escala dentro deste painel. A distância mostra a diferença entre média e mediana, sem identificar causas.'}</p>${jobs?`<template id="salary-all">${all.map(markup).join('')}</template>`:''}`;
}
function bindSalaryControls(){
 const input=$('salary-search'),limit=$('salary-limit');if(!input)return;
 const refresh=()=>{
  const source=$('salary-all').content,query=input.value.trim().toLocaleLowerCase('pt-BR');
  const rows=[...source.querySelectorAll('.salary-compare-row')].filter(row=>row.dataset.salaryName.toLocaleLowerCase('pt-BR').includes(query));
  const count=limit.value==='all'?rows.length:Number(limit.value);
  const fragment=document.createDocumentFragment();rows.slice(0,count).forEach(row=>fragment.appendChild(row.cloneNode(true)));
  $('salary-jobs').replaceChildren(fragment);
  if(!rows.length)$('salary-jobs').innerHTML='<p class="empty">Nenhum cargo encontrado. Ajuste a busca.</p>';
  $('salary-jobs-count').textContent=`Exibindo ${Math.min(count,rows.length)} de ${rows.length} cargos encontrados. Busca local deste gráfico; filtros globais, KPIs e CSV permanecem no recorte aplicado.`;
  activateVisuals(false);
 };
 input.addEventListener('input',refresh);limit.addEventListener('change',refresh);
}
function metricMethod() {
 return panel('Regras de cálculo','Mesmas definições em cartões, resumos, gráficos, tabela e CSV.',
 `<div class="method-copy"><ul>
 <li><strong>Valores válidos:</strong> números finitos e não negativos da base preparada. Nulos, campos ausentes, textos, infinitos e valores negativos não são convertidos em zero.</li>
 <li><strong>Somas:</strong> soma dos valores válidos. Com registros no grupo e nenhum valor válido, mostrar “—”. Sem registros elegíveis, uma contagem ou soma é zero; médias, medianas e taxas continuam indisponíveis.</li>
 <li><strong>Média:</strong> soma dos valores válidos ÷ quantidade de valores válidos do recorte. Cada pessoa tem peso igual; médias de departamentos não são promediadas.</li>
 <li><strong>Mediana salarial:</strong> salários base válidos dos ativos ordenados. Para quantidade ímpar, usar o valor central; para quantidade par, a média dos dois centrais.</li>
 <li><strong>Metas:</strong> pessoas com meta válida ≥ 100 ÷ pessoas com meta válida × 100. Pessoas sem informação não entram como resultado abaixo da meta. O panorama mostra separadamente essas ausências.</li>
 <li><strong>Acidentes:</strong> ocorrências válidas ÷ registros com informação válida de acidentes × 100. Zero ocorrências é informação válida. Ausência não significa “sem ocorrência”. Sem período ou horas de exposição, isso não mede risco nem frequência temporal.</li>
 <li><strong>Bolhas:</strong> médias e área calculadas somente para registros com horas extras e meta válidas simultaneamente. A área representa essa população com pares válidos.</li>
 <li><strong>Senioridade:</strong> contagem por Nivel_Cargo registrado. Categorias ausentes aparecem como “Não informado”. Não é uma inferência a partir da idade ou do tempo de empresa.</li>
 <li><strong>Histórico:</strong> contagens anuais da amostra. Em 31/12, contar admissões até essa data e saídas posteriores; quem sai em 31/12 já não integra a posição final. Datas inválidas são excluídas. Os atributos e o status dos filtros são os registrados, não snapshots históricos.</li>
 <li><strong>Precisão:</strong> cálculos usam os valores sem arredondamento intermediário. Médias e medianas salariais são exibidas com duas casas; CSV arredonda números para duas casas e representa valores indisponíveis por campos vazios. As colunas “n” informam os denominadores válidos.</li>
 </ul><p>Turnover, comparações mensais de folha, variações entre competências e tempo de empresa continuam dependentes de informações adicionais. Não foram estimados para preencher o painel.</p></div>`);
}
function interactionMethod() {
 return panel('Como explorar e compartilhar o recorte','Filtros globais, datas de movimentação e busca da tabela têm escopos explícitos.',
 `<div class="method-copy"><ul>
 <li><strong>Interseção:</strong> departamento, cargo, UF, modelo de trabalho, status, senioridade e seleções dos gráficos precisam ser atendidos simultaneamente. KPIs, gráficos, textos e tabela recebem o mesmo conjunto de registros.</li>
 <li><strong>Datas:</strong> escolha admissão, desligamento ou admissão ou desligamento. Os limites inicial e final são inclusivos e podem ficar abertos. Em “ou”, uma pessoa entra uma única vez, mesmo tendo os dois eventos no período.</li>
 <li><strong>Coorte, não competência:</strong> o período seleciona pessoas por suas movimentações. Salários, metas, horas extras e acidentes permanecem os valores registrados dessas pessoas; não são valores históricos do período escolhido. O filtro de desligamento exige status desligado e datas válidas em ordem cronológica.</li>
 <li><strong>Aplicar período:</strong> editar os campos não muda resultados nem o link até a aplicação. Uma faixa invertida mostra erro e mantém o recorte anterior. Copiar link ou exportar sempre usa o recorte aplicado.</li>
 <li><strong>Seleção nos gráficos:</strong> clique, Enter ou Espaço aplica filtros. Repetir a mesma seleção remove seus campos. Composições e heatmap podem aplicar duas dimensões juntas. As etiquetas permitem remover cada filtro separadamente.</li>
 <li><strong>Movimentações:</strong> pontos anuais de admissões ou desligamentos aplicam o respectivo ano e tipo de evento. A posição de quadro reconstruído permanece descritiva. Barras mensais filtram o mês de desligamento.</li>
 <li><strong>Faixa salarial:</strong> seleciona somente ativos com salário válido, pois essa distribuição usa essa população. Os comparativos por cargo ou departamento selecionam a categoria no recorte geral; não acrescentam status implicitamente.</li>
 <li><strong>Tabela e CSV:</strong> busca de grupos, agrupamento e ordenação afetam somente a tabela e a exportação. A busca não altera KPIs ou gráficos. O CSV mantém as 16 colunas da Fase 3.</li>
 <li><strong>Link:</strong> contém seção, filtros aplicados, visualização do histórico, agrupamento de segurança e configuração da tabela. Recarregar ou usar voltar/avançar restaura esse estado. Campos inválidos no link são ignorados com aviso. Tema, menu aberto e edição de período ainda não aplicada não fazem parte do link.</li>
 <li><strong>Limpar:</strong> remove filtros globais, datas e busca; mantém a seção, os agrupamentos e a ordenação escolhida.</li>
 </ul></div>`);
}
