// Cálculos puros compartilhados entre cartões, gráficos, textos, tabela e CSV.
// A base preparada usa números; texto numérico não é convertido silenciosamente.
(function(root, factory) {
 const metrics = factory();
 if (typeof module === 'object' && module.exports) module.exports = metrics;
 else root.RHMetrics = metrics;
})(typeof globalThis === 'object' ? globalThis : this, function() {
 'use strict';
 const valid = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
 const values = (rows, field) => rows.map(row => row[field]).filter(valid);
 function stats(rows, field) {
  const observed = values(rows, field).sort((a, b) => a - b);
  const n = observed.length;
  const total = n ? observed.reduce((a, b) => a + b, 0) : rows.length ? null : 0;
  const mid = Math.floor(n / 2);
  return { n, missing: rows.length - n, total,
   mean: n ? total / n : null,
   median: n ? (n % 2 ? observed[mid] : (observed[mid - 1] + observed[mid]) / 2) : null };
 }
 const sum = (rows, field) => stats(rows, field).total;
 const mean = (rows, field) => stats(rows, field).mean;
 const median = (rows, field) => stats(rows, field).median;
 const rate = (count, denominator) => valid(count) && valid(denominator) && denominator > 0 ? count / denominator * 100 : null;
 function groups(rows, field) {
  const grouped = new Map();
  for (const row of rows) {
   const raw = row[field];
   const name = raw == null || String(raw).trim() === '' ? 'Não informado' : String(raw);
   if (!grouped.has(name)) grouped.set(name, []);
   grouped.get(name).push(row);
  }
  return [...grouped].map(([name, items]) => ({ name, items, n: items.length }));
 }
 function summary(rows) {
  const active = rows.filter(row => row.Status === 'Ativo');
  const goals = rows.filter(row => valid(row.Meta_Atingida_Pct));
  const met = goals.filter(row => row.Meta_Atingida_Pct >= 100).length;
  const salary = stats(active, 'Salario_Base');
  const accidents = stats(rows, 'Acidentes_Trabalho');
  return {
   people: rows.length, active: active.length,
   departed: rows.filter(row => row.Status === 'Desligado').length,
   salary, bonus: stats(active, 'Bonus_Anual_RS'),
   goals: { n: goals.length, met, below: goals.length - met, missing: rows.length - goals.length,
    share: rate(met, goals.length), mean: mean(goals, 'Meta_Atingida_Pct') },
   age: stats(rows, 'Idade'), extra: stats(rows, 'Horas_Extra_Mes'),
   accidents: { ...accidents, people: rows.filter(row => valid(row.Acidentes_Trabalho) && row.Acidentes_Trabalho > 0).length,
    rate: rate(accidents.total, accidents.n) }
  };
 }
 function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
 }
 function history(rows, universe = rows) {
  const dates = universe.flatMap(row => [row.Data_Admissao, row.Data_Desligamento]).filter(validDate);
  if (!dates.length) return [];
  const years = dates.map(date => Number(date.slice(0, 4)));
  const start = Math.min(...years), end = Math.max(...years);
  return Array.from({ length: end - start + 1 }, (_, i) => {
   const year = start + i, cutoff = `${year}-12-31`;
   return { year,
    admissions: rows.filter(row => validDate(row.Data_Admissao) && row.Data_Admissao.startsWith(String(year))).length,
    departures: rows.filter(row => validDate(row.Data_Admissao) && validDate(row.Data_Desligamento) && row.Data_Desligamento >= row.Data_Admissao && row.Data_Desligamento.startsWith(String(year))).length,
    headcount: rows.filter(row => validDate(row.Data_Admissao) && row.Data_Admissao <= cutoff && (
     row.Data_Desligamento == null ? row.Status === 'Ativo' :
     validDate(row.Data_Desligamento) && row.Data_Desligamento >= row.Data_Admissao && row.Data_Desligamento > cutoff
    )).length
   };
  });
 }
 return Object.freeze({ valid, values, stats, sum, mean, median, rate, groups, summary, validDate, history });
});
