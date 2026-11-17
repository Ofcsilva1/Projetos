// Plano da consulta: permite somente operações de leitura e períodos explícitos.
import { collectActivities, strictDate, todayISO } from './workflow-core.js?v=20261016.demo1';
import { FILTER_FIELDS, FILTER_SCHEMA, validateFilters, selectCases, describeFilters, categoryValues } from './nexus-filters.js';
import { SERVICE_TOPICS, answerServiceTopic } from './nexus-knowledge.js';

export const INDICATORS = ['total_prontuarios', 'entradas', 'cadastros', 'atendimentos', 'faltas'];
export const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    acao: { type: 'string', enum: ['consultar', 'resumir', 'explicar', 'conhecimento', 'informacao_ausente', 'consulta_indisponivel', 'acesso_indisponivel', 'esclarecer', 'fora_escopo'] },
    indicadores: { type: 'array', items: { type: 'string', enum: INDICATORS } },
    inicio: { type: 'string', description: 'Data inclusiva YYYY-MM-DD ou vazio para toda a base.' },
    fim: { type: 'string', description: 'Data inclusiva YYYY-MM-DD ou vazio para toda a base.' },
    filtros: FILTER_SCHEMA,
    agruparPor: { type: 'string', enum: ['', ...Object.keys(FILTER_FIELDS)] },
    tema: { type: 'string', enum: ['', ...Object.keys(SERVICE_TOPICS)] }
  },
  required: ['acao', 'indicadores', 'inicio', 'fim', 'filtros', 'agruparPor', 'tema'],
  additionalProperties: false
};

export function validatePlan(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || !['acao', 'indicadores', 'inicio', 'fim'].every(key => Object.hasOwn(value, key))
    || Object.keys(value).some(key => !['acao', 'indicadores', 'inicio', 'fim', 'filtros', 'agruparPor', 'tema'].includes(key))
    || !PLAN_SCHEMA.properties.acao.enum.includes(value.acao)
    || !Array.isArray(value.indicadores) || value.indicadores.length > 5
    || value.indicadores.some(name => !INDICATORS.includes(name))
    || new Set(value.indicadores).size !== value.indicadores.length
    || typeof value.inicio !== 'string' || typeof value.fim !== 'string') throw new Error('Plano de consulta inválido.');
  const allTime = value.inicio === '' && value.fim === '';
  if (!allTime && (!strictDate(value.inicio) || !strictDate(value.fim) || value.inicio > value.fim)) throw new Error('Período inválido.');
  if (['consultar', 'resumir', 'explicar'].includes(value.acao) && (!value.indicadores.length || (!allTime && value.indicadores.includes('total_prontuarios')))) throw new Error('Indicadores incompatíveis com o período.');
  const plan = { acao: value.acao, indicadores: [...value.indicadores], inicio: value.inicio, fim: value.fim };
  // Compatibilidade: aceita planos antigos, mas valida rigorosamente todo parâmetro novo.
  if (Object.hasOwn(value, 'filtros')) plan.filtros = validateFilters(value.filtros);
  if (Object.hasOwn(value, 'agruparPor')) {
    if (typeof value.agruparPor !== 'string' || (value.agruparPor && !Object.hasOwn(FILTER_FIELDS, value.agruparPor))) throw new Error('Agrupamento não permitido.');
    plan.agruparPor = value.agruparPor;
  }
  if (Object.hasOwn(value, 'tema')) {
    if (typeof value.tema !== 'string' || (value.tema && !Object.hasOwn(SERVICE_TOPICS, value.tema))) throw new Error('Tema não permitido.');
    plan.tema = value.tema;
  }
  if (plan.acao === 'conhecimento' && !plan.tema) throw new Error('Informe o tema institucional.');
  return plan;
}

// Data da métrica: mantém a distinção entre entrada no serviço e criação no sistema.
function metricDate(data, metric) {
  if (metric === 'entradas') return data.dataEntrada;
  if (typeof data.criadoEm !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(data.criadoEm)) return null;
  const instant = new Date(data.criadoEm);
  return Number.isNaN(instant.getTime()) ? null : todayISO(instant);
}

function countIndicator(plan, metric, cases) {
  const within = date => strictDate(date) && (!plan.inicio || (date >= plan.inicio && date <= plan.fim));
  if (metric === 'total_prontuarios') return cases.length;
  if (metric === 'entradas' || metric === 'cadastros') return cases.filter(({ data }) => within(metricDate(data, metric))).length;
  return collectActivities(cases, 'agenda').items.filter(({ activity }) => metric === 'atendimentos'
    ? activity.situacao === 'realizado' && within(activity.dataConclusao)
    : activity.situacao === 'nao_compareceu' && within(activity.data)).length;
}

// Significado dos indicadores: explica a origem das contagens sem precisar de dados pessoais.
const DEFINITIONS = {
  total_prontuarios: 'Total de prontuários: quantidade de registros que existem na base, independentemente da data. Não comprova a quantidade de pessoas únicas se houver duplicidades.',
  entradas: 'Entrada no serviço: usa a Data de entrada do prontuário. Representa quando a pessoa ingressou no serviço, conforme o preenchimento da ficha.',
  cadastros: 'Cadastro no sistema: usa a data de criação do registro (criadoEm). Importar uma ficha antiga cria um cadastro agora; isso não significa uma pessoa nova no serviço.',
  atendimentos: 'Atendimento realizado: registro da agenda marcado como Realizado, contado pela data real de realização. Um agendamento ou uma anotação antiga em texto não entra automaticamente neste total.',
  faltas: 'Falta: registro da agenda marcado como Não compareceu, contado pela data prevista. Cancelamentos e agendamentos passados sem confirmação de falta não contam como ausência.'
};

// Linguagem direta: flexiona os nomes e responde primeiro ao que foi perguntado.
const quantity = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;
const formatDate = date => date.split('-').reverse().join('/');
function activeWithReturn(plan) {
  return [['situacaoAtual', 'ativo'], ['retornoSolicitado', 'sim']].every(([field, value]) =>
    (plan.filtros || []).some(filter => filter.campo === field && filter.valores.length === 1 && filter.valores[0] === value));
}

// Observações relevantes: mantém apenas lacunas que afetam a leitura do resultado.
function metricNotes(plan, cases) {
  const notes = [];
  for (const [metric, dateLabel] of [['entradas', 'entrada'], ['cadastros', 'criação']]) {
    if (!plan.indicadores.includes(metric)) continue;
    const missing = cases.filter(({ data }) => !strictDate(metricDate(data, metric))).length;
    if (missing) notes.push(`${quantity(missing, 'prontuário sem', 'prontuários sem')} data de ${dateLabel} ${missing === 1 ? 'ficou' : 'ficaram'} fora dessa contagem.`);
  }
  if (plan.indicadores.some(metric => ['atendimentos', 'faltas'].includes(metric))) {
    const { invalid } = collectActivities(cases, 'agenda');
    if (invalid) notes.push(`${quantity(invalid, 'registro de agenda inválido foi desconsiderado', 'registros de agenda inválidos foram desconsiderados')}.`);
    if (plan.indicadores.some(metric => ['atendimentos', 'faltas'].includes(metric) && countIndicator(plan, metric, cases) === 0)) notes.push('Os zeros indicam ausência de registros estruturados no recorte.');
  }
  return notes;
}

// Resumo em texto: reúne os números sem repetir as definições de cada indicador.
function answerSummary(plan, cases) {
  const allTime = !plan.inicio;
  const period = allTime ? 'Na base atual' : `De ${formatDate(plan.inicio)} a ${formatDate(plan.fim)}`;
  const counts = Object.fromEntries(INDICATORS.map(metric => [metric, countIndicator(plan, metric, cases)]));
  const phrases = {
    total_prontuarios: quantity(counts.total_prontuarios, 'prontuário existente', 'prontuários existentes'),
    entradas: quantity(counts.entradas, 'entrada no serviço', 'entradas no serviço'),
    cadastros: quantity(counts.cadastros, 'cadastro criado no sistema', 'cadastros criados no sistema'),
    atendimentos: quantity(counts.atendimentos, 'atendimento realizado', 'atendimentos realizados'),
    faltas: quantity(counts.faltas, 'falta registrada', 'faltas registradas')
  };
  const facts = plan.indicadores.map(name => phrases[name]);
  const joined = facts.length > 1 ? `${facts.slice(0, -1).join(', ')} e ${facts.at(-1)}` : facts[0];
  return [`${period}: ${joined}.`, ...metricNotes(plan, cases)].join('\n\n');
}

// Resposta conferível: o Gemini escolhe a consulta; os números vêm da base fictícia local.
function answerValidatedPlan(plan, cases) {
  if (plan.acao === 'fora_escopo') return 'Essa pergunta foge do escopo do serviço. Posso responder sobre o Proteja e o Nexo.';
  if (plan.acao === 'informacao_ausente') return answerServiceTopic('rede_nao_cadastrada');
  if (plan.acao === 'consulta_indisponivel') return 'A pergunta é pertinente ao serviço, mas essa consulta ainda não está disponível para os campos solicitados.';
  if (plan.acao === 'acesso_indisponivel') return 'Dados individuais e relatos exigem autenticação e verificação de permissões, ainda não disponíveis no laboratório.';
  if (plan.acao === 'conhecimento') return answerServiceTopic(plan.tema);
  if (plan.acao === 'esclarecer') return 'Qual período, indicador ou critério você quer consultar?';
  if (plan.acao === 'explicar') return plan.indicadores.map(name => DEFINITIONS[name]).join('\n\n');
  if (plan.acao === 'resumir') return answerSummary(plan, cases);
  const lines = [];
  for (const indicator of plan.indicadores) {
    if (indicator === 'total_prontuarios') {
      lines.push(activeWithReturn(plan)
        ? `${quantity(cases.length, 'prontuário ativo', 'prontuários ativos')} com retorno solicitado.`
        : `Total de prontuários: ${cases.length}.`);
    } else if (indicator === 'entradas' || indicator === 'cadastros') {
      const total = countIndicator(plan, indicator, cases);
      lines.push(indicator === 'entradas'
        ? `Prontuários com entrada no serviço: ${total}.`
        : `Prontuários cadastrados no sistema: ${total}.`);
    } else {
      const { items } = collectActivities(cases, 'agenda');
      const within = date => strictDate(date) && (!plan.inicio || (date >= plan.inicio && date <= plan.fim));
      const matches = items.filter(({ activity }) => indicator === 'atendimentos'
        ? activity.situacao === 'realizado' && within(activity.dataConclusao)
        : activity.situacao === 'nao_compareceu' && within(activity.data));
      lines.push(indicator === 'atendimentos'
        ? `Atendimentos realizados: ${matches.length}.`
        : `Faltas registradas: ${matches.length}, em ${quantity(new Set(matches.map(item => item.caseKey)).size, 'prontuário', 'prontuários')}.`);
    }
  }
  if (plan.inicio) lines.push(`Período: ${formatDate(plan.inicio)} a ${formatDate(plan.fim)}.`);
  lines.push(...metricNotes(plan, cases));
  return lines.join('\n\n');
}

// Recortes e distribuições: aplicam filtros antes de contar e explicitam informações ausentes.
export function answerPlannedQuestion(value, cases) {
  const plan = validatePlan(value);
  if (!['consultar', 'resumir'].includes(plan.acao)) return answerValidatedPlan(plan, cases);
  const filters = plan.filtros || [];
  const { selected, uncertain } = selectCases(cases, filters);
  // Critérios já expressos na resposta não precisam ser repetidos em outro parágrafo.
  const visibleFilters = plan.acao === 'consultar' && plan.indicadores.includes('total_prontuarios') && activeWithReturn(plan)
    ? filters.filter(filter => !['situacaoAtual', 'retornoSolicitado'].includes(filter.campo)) : filters;
  const lines = [answerValidatedPlan(plan, selected), describeFilters(visibleFilters)].filter(Boolean);
  if (uncertain.length) lines.push(`${quantity(uncertain.length, 'prontuário com', 'prontuários com')} dados incompletos ou inválidos ${uncertain.length === 1 ? 'ficou' : 'ficaram'} fora da contagem.`);
  if (plan.agruparPor) {
    const field = plan.agruparPor, config = FILTER_FIELDS[field];
    const groups = new Map();
    for (const record of selected) {
      const values = categoryValues(record.data, field);
      for (const value of values.length ? values : ['valor_nao_reconhecido']) {
        if (!groups.has(value)) groups.set(value, []);
        groups.get(value).push(record);
      }
    }
    const labels = { total_prontuarios: ['prontuário existente', 'prontuários existentes'], entradas: ['entrada', 'entradas'], cadastros: ['cadastro', 'cadastros'], atendimentos: ['atendimento realizado', 'atendimentos realizados'], faltas: ['falta', 'faltas'] };
    const rows = [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([value, group]) => `${config.values[value] || 'Valor não reconhecido'}: ${plan.indicadores.map(metric => quantity(countIndicator(plan, metric, group), ...labels[metric])).join('; ')}.`);
    lines.push(`Distribuição por ${config.label}:\n${rows.length ? rows.join('\n') : 'Nenhum prontuário corresponde aos filtros.'}`);
    if (config.multiple && selected.some(record => categoryValues(record.data, field).length > 1)) lines.push('Um prontuário pode aparecer em vários grupos; a soma dos grupos pode superar o total.');
  }
  return lines.join('\n\n');
}
