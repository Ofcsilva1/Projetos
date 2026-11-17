// Catálogo dos campos: combina somente categorias existentes nos formulários do Nexo.
import { normalize } from './import-core.js?v=20261016.demo1';
import { VIOLENCE_TYPES, SEXUAL_TYPES, violenceTags } from './violence.js?v=20261016.demo1';

const choices = values => Object.fromEntries(values);
export const FILTER_FIELDS = {
  cor: { label: 'Raça/cor', headers: ['COR'], values: choices([['preto', 'Preto(a)'], ['pardo', 'Pardo(a)'], ['branco', 'Branco(a)'], ['amarelo', 'Amarelo(a)'], ['indigena', 'Indígena']]) },
  tipoViolencia: { label: 'Tipo de violência', headers: ['Tipo de violência'], multiple: true, values: choices(VIOLENCE_TYPES) },
  violenciaSexual: { label: 'Subtipo de violência sexual', headers: ['Sexual'], multiple: true, values: choices(SEXUAL_TYPES) },
  situacaoAtual: { label: 'Situação do prontuário', headers: ['Situação atual', 'Situação atual do caso'], values: choices([['ativo', 'Ativo'], ['suspenso', 'Suspenso'], ['encerrado_com_protecao', 'Encerrado com proteção'], ['encerrado_sem_protecao', 'Encerrado sem proteção'], ['nao_competencia', 'Fora da competência']]) },
  origemCaso: { label: 'Origem do caso', headers: ['Origem do caso recebido no Proteja', 'Origem do caso recebido no gestao-casos'], values: choices([['demanda_criad', 'Demanda espontânea da CRIAD'], ['demanda_responsavel', 'Demanda espontânea do responsável'], ['enc_dercca', 'Encaminhamento da DERRCA'], ['enc_ct', 'Encaminhamento do CT'], ['enc_mp', 'Encaminhamento do MP'], ['enc_assist_social', 'Encaminhamento da Assist. Social'], ['enc_educacao', 'Encaminhamento Educação'], ['enc_saude', 'Encaminhamento da Saúde'], ['enc_outra_rede', 'Encaminhamento de outro órgão']]) },
  comunicacaoViolencia: { label: 'Comunicação da violência', headers: ['Comunicação da Violência pelo Proteja', 'Comunicação da Violência pelo gestao-casos'], values: choices([['comunicacao_ct', 'Comunicação ao CT'], ['comunicacao_policia', 'Comunicação à Polícia'], ['comunicacao_mp', 'Comunicação ao MP'], ['nao', 'Não houve comunicação']]) },
  encaminhamentosSolicitados: { label: 'Tipo de encaminhamento', headers: ['Encaminhamentos solicitados pelo Proteja (referência/ contrarreferência)', 'Encaminhamentos solicitados pelo gestao-casos (referência/ contrarreferência)'], values: choices([['apoio_ct', 'Apoio ao CT'], ['educacao', 'Política de Educação'], ['assist_social', 'Política de Assist. Social'], ['saude', 'Política de Saúde'], ['servico_especializado', 'Serviço Especializado'], ['outros', 'Outros']]) },
  retornoSolicitado: { label: 'Retorno solicitado', headers: ['Houve retorno solicitado pelo Proteja?', 'Houve retorno solicitado pelo gestao-casos?'], values: { sim: 'Sim', nao: 'Não' } },
  estudoCaso: { label: 'Estudo de caso elaborado', headers: ['Estudo de Caso (EC) elaborado?'], values: { sim: 'Sim', nao: 'Não' } },
  piaElaborado: { label: 'Plano individual elaborado', headers: ['Plano Individual de Atendimento elaborado?', 'Plano Indivividual de Atendimento elaborado?'], values: { sim: 'Sim', nao: 'Não' } }
};
for (const config of Object.values(FILTER_FIELDS)) config.values.nao_informado = 'Não informado';

// Contrato da consulta: OU entre valores do mesmo campo; E entre campos diferentes.
export const FILTER_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      campo: { type: 'string', enum: Object.keys(FILTER_FIELDS) },
      operador: { type: 'string', enum: ['qualquer', 'todos'] },
      // A API recebe uma estrutura simples; a lista exata de valores é validada abaixo.
      valores: { type: 'array', items: { type: 'string' } }
    },
    required: ['campo', 'operador', 'valores'], additionalProperties: false
  }
};

export function validateFilters(value) {
  if (!Array.isArray(value) || value.length > Object.keys(FILTER_FIELDS).length) throw new Error('Filtros inválidos.');
  const fields = new Set();
  return value.map(filter => {
    const config = filter && Object.hasOwn(FILTER_FIELDS, filter.campo) ? FILTER_FIELDS[filter.campo] : null;
    if (!config || Object.keys(filter).sort().join(',') !== 'campo,operador,valores' || fields.has(filter.campo)
      || !['qualquer', 'todos'].includes(filter.operador) || !Array.isArray(filter.valores) || !filter.valores.length || filter.valores.length > 20
      || filter.valores.some(item => typeof item !== 'string' || !Object.hasOwn(config.values, item))
      || new Set(filter.valores).size !== filter.valores.length
      || (filter.operador === 'todos' && filter.valores.length > 1 && !config.multiple)) throw new Error('Filtro não suportado pelo sistema.');
    fields.add(filter.campo);
    return { campo: filter.campo, operador: filter.operador, valores: [...filter.valores] };
  });
}

// Leitura do registro: usa campos preenchidos, nunca deduz categorias por nome ou relato.
function fieldValue(data, field) {
  if (Object.hasOwn(data, field)) return data[field];
  try {
    const original = JSON.parse(data.dadosPlanilha || '{}');
    const headers = FILTER_FIELDS[field].headers.map(normalize);
    const key = Object.keys(original || {}).find(key => headers.includes(normalize(key)));
    return key === undefined ? '' : original[key];
  } catch { return ''; }
}

export function categoryValues(data, field) {
  if (!Object.hasOwn(FILTER_FIELDS, field)) throw new Error('Campo não permitido.');
  if (field === 'tipoViolencia' || field === 'violenciaSexual') {
    const tags = violenceTags(data);
    const tagsOfField = field === 'tipoViolencia' ? tags.types : tags.subtypes;
    if (!tagsOfField.size) return ['nao_informado'];
    return [...new Set([...tagsOfField.keys()].map(key => Object.hasOwn(FILTER_FIELDS[field].values, key) ? key : 'valor_nao_reconhecido'))];
  }
  const raw = normalize(fieldValue(data, field));
  if (['', 'nao informado', 'nao informada', 'sem informacao', 'nao se aplica', 'n/i', 'ni', 'nao_informado'].includes(raw)) return ['nao_informado'];
  for (const [key, label] of Object.entries(FILTER_FIELDS[field].values)) {
    if (raw === normalize(key) || raw === normalize(label)) return [key];
  }
  if (field === 'cor') {
    // Sinônimos de categorias declaradas: "negra" é uma regra de pergunta, não recodifica a planilha.
    const simple = raw.replace(/\s*\([ao]\)$/, '').trim();
    const aliases = { preto: 'preto', preta: 'preto', pardo: 'pardo', parda: 'pardo', branco: 'branco', branca: 'branco', amarelo: 'amarelo', amarela: 'amarelo', indigena: 'indigena' };
    if (Object.hasOwn(aliases, simple)) return [aliases[simple]];
  }
  if (field === 'situacaoAtual' && ['nao e competencia', 'fora de competencia', 'nao competencia'].includes(raw)) return ['nao_competencia'];
  return [];
}

function matches(values, filter) {
  return filter.operador === 'todos' ? filter.valores.every(value => values.includes(value)) : filter.valores.some(value => values.includes(value));
}

export function selectCases(cases, filters) {
  const selected = [], uncertain = [];
  for (const record of cases) {
    let rejected = false, unknown = false;
    for (const filter of filters) {
      const values = categoryValues(record.data, filter.campo);
      const missing = !values.length || (values.includes('nao_informado') && !filter.valores.includes('nao_informado'))
        || (values.includes('valor_nao_reconhecido') && !matches(values, filter));
      if (missing) unknown = true;
      else if (!matches(values, filter)) rejected = true;
    }
    if (!rejected && !unknown) selected.push(record);
    else if (!rejected && unknown) uncertain.push(record);
  }
  return { selected, uncertain };
}

export function describeFilters(filters) {
  if (!filters.length) return '';
  const parts = filters.map(filter => `${FILTER_FIELDS[filter.campo].label}: ${filter.valores.map(value => FILTER_FIELDS[filter.campo].values[value]).join(filter.operador === 'todos' ? ' E ' : ' OU ')}`);
  return `Recorte: ${parts.join('; ')}.`;
}

// Catálogo para o Gemini: contém nomes e categorias públicas do formulário, sem registros.
export function filterCatalogText() {
  return Object.entries(FILTER_FIELDS).map(([field, config]) => `${field} (${config.label}): ${Object.entries(config.values).map(([value, label]) => `${value} = ${label}`).join('; ')}`).join('\n');
}
