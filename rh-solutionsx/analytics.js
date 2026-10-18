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
 const items=all.slice(0,limit);
 const max=Math.max(1,...items.flatMap(g=>[g.stats.mean??0,g.stats.median??0]));
 return `<div class="salary-comparison">${items.map(g=>`<div class="salary-compare-row">
  <div class="salary-group"><strong>${esc(g.name)}</strong><small>${g.stats.n} salários válidos / ${g.n} ativos</small></div>
  <div class="salary-dual">${[['Média','mean'],['Mediana','median']].map(([label,key])=>{
   const value=g.stats[key],text=`${g.name}: ${label.toLowerCase()} ${money(value,2)}, n=${g.stats.n}`;
   return `<div class="salary-series chart-point" tabindex="0" aria-label="${esc(text)}" data-tip="${esc(text)}"><span>${label}</span>${value===null?'<span class="caption">Sem informação</span>':`<div class="track"><div class="fill ${key}" style="width:${value/max*100}%"></div></div>`}<strong>${money(value,2)}</strong></div>`;
  }).join('')}</div></div>`).join('')}</div>`+
  (all.length>limit?`<p class="caption">Exibindo ${limit} de ${all.length} cargos, ordenados pela média. Veja todos os grupos na tabela.</p>`:'');
}
function metricMethod() {
 return panel('Regras de cálculo da Fase 3','Mesmas definições em cartões, resumos, gráficos, tabela e CSV.',
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
