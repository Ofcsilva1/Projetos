// Períodos da consulta: valida datas e usa o calendário do serviço na Bahia.
import { addDays, strictDate, todayISO } from './workflow-core.js?v=20261016.demo1';
import { answerPlannedQuestion } from './nexus-plan.js';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const periodPattern = /\bde \d{2}\/\d{2}\/\d{4} (?:a|ate) \d{2}\/\d{2}\/\d{4}\b|\bultimos? \d+ dias?\b|\bhoje\b|\bmes (?:passado|anterior|atual)\b|\b(?:este|neste|nesse|deste|desse) mes\b/g;

// Vocabulário do protótipo: termos extras pedem esclarecimento, sem inventar filtros.
const supportedWords = new Set(('quantos quantas qual o a os as de do da dos das e nos nas no na em tivemos teve tem temos foram foi houve total numero mostre mostrar me um uma gere gerar faca resumo movimento relatorio prontuario prontuarios pessoa pessoas novas nova novos novo cadastro cadastros cadastrados cadastradas cadastrado cadastrada criados criadas criado criada tiveram entrada entradas servico sistema atendimento atendimentos realizados realizado realizamos realizou faltas falta faltaram nao compareceram compareceu registradas registrados com registro registros').split(' '));

export function resolvePeriod(question, today = todayISO()) {
  const text = normalize(question);
  if ([...text.matchAll(periodPattern)].length !== 1) return null;
  const explicit = text.match(/\bde (\d{2}\/\d{2}\/\d{4}) (?:a|ate) (\d{2}\/\d{2}\/\d{4})\b/);
  if (explicit) {
    const start = explicit[1].split('/').reverse().join('-');
    const end = explicit[2].split('/').reverse().join('-');
    return strictDate(start) && strictDate(end) && start <= end ? { start, end } : null;
  }
  // Datas ou meses não reconhecidos pedem esclarecimento; nunca viram o mês atual.
  if (/\d{4}|\d{1,2}[/.-]\d|janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/.test(text)) return null;
  const days = text.match(/\bultimos? (\d+) dias?\b/);
  if (days) {
    const count = Number(days[1]);
    return count >= 1 && count <= 3660 ? { start: addDays(today, 1 - count), end: today } : null;
  }
  if (/\bhoje\b/.test(text)) return { start: today, end: today };
  if (/\bmes (?:passado|anterior)\b/.test(text)) {
    const end = addDays(`${today.slice(0, 7)}-01`, -1);
    return { start: `${end.slice(0, 7)}-01`, end };
  }
  if (/\b(?:este|neste|nesse|deste|desse) mes\b|\bmes atual\b/.test(text)) {
    return { start: `${today.slice(0, 7)}-01`, end: today };
  }
  return null;
}

// Contagens locais: consulta apenas totais e não transforma anotações em atendimentos.
export function answerLocalQuestion(question, cases, today = todayISO()) {
  const text = normalize(question.trim());
  const intro = 'Este modo responde somente a consultas locais de totais do serviço. Para interpretar outras formas de perguntar, selecione Gemini com a chave configurada.';
  if (!text || text.length > 600) return 'Escreva uma pergunta com até 600 caracteres.';
  if (/\b(?:nome|nomes|cpf|senha|relato|relatos|anotacoes|diagnostico|diagnosticos|ignore|ignorar|finja|administrador)\b/.test(text)) {
    return `${intro} Não disponibilizo dados individuais ou anotações técnicas nesta versão.`;
  }
  const summary = /\b(?:resumo|movimento|relatorio)\b/.test(text);
  const newCases = /prontuarios?|pessoas? (?:novas?|cadastrad[oa]s?|criad[oa]s?)|novos? cadastros?/.test(text);
  const appointments = /atendimentos?/.test(text);
  const absences = /faltas?|faltaram|nao compareceram/.test(text);
  if (!summary && !newCases && !appointments && !absences) {
    return `${intro} Experimente: “Quantos prontuários tiveram entrada neste mês?” ou “Quantas faltas tivemos nos últimos 45 dias?”.`;
  }
  // Filtros ainda não implementados não podem receber uma contagem geral como resposta.
  if (/\b(?:por|somente|apenas|tecnico|tecnica|unidade|equipe|compare|comparar|diferenca|percentual|taxa|media|ativos|suspensos|cancelados|agendados|semana|ano)\b/.test(text)) {
    return 'Nesta etapa consulto totais gerais por período, sem filtros por pessoa, equipe, situação ou comparação. Experimente “Resumo deste mês”.';
  }
  const period = resolvePeriod(question, today);
  if (!period) return 'Informe o período: “neste mês”, “mês passado”, “hoje”, “últimos 45 dias” ou “de 01/11/2026 até 16/11/2026”.';
  const words = text.replace(periodPattern, '').split(/\s+/).map(word => word.replace(/[?!.,;:]/g, '')).filter(Boolean);
  if (words.some(word => !supportedWords.has(word))) {
    return 'Essa pergunta inclui detalhes que o protótipo local ainda não interpreta. Use uma das sugestões ou pergunte pelo total de prontuários, atendimentos realizados ou faltas em um único período.';
  }
  // Mesmo padrão de resposta: o modo local e o Gemini usam as mesmas contagens e textos.
  const indicators = summary ? ['entradas', 'cadastros', 'atendimentos', 'faltas'] : [];
  if (!summary) {
    if (newCases) indicators.push(/criad|cadastrad/.test(text) ? 'cadastros' : 'entradas');
    if (appointments) indicators.push('atendimentos');
    if (absences) indicators.push('faltas');
  }
  return answerPlannedQuestion({ acao: summary ? 'resumir' : 'consultar', indicadores: indicators, inicio: period.start, fim: period.end }, cases);
}
