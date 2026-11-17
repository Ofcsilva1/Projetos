// Consultas combinadas: verifica categorias, campos vazios, importações e contagens sem duplicar casos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerPlannedQuestion, validatePlan } from '../nexus-plan.js';
import { categoryValues, selectCases, validateFilters } from '../nexus-filters.js';
import { buildActivity } from '../workflow-core.js';

const filter = (campo, valores, operador = 'qualquer') => ({ campo, operador, valores });
const filters = [filter('tipoViolencia', ['fisica']), filter('cor', ['preto'])];
const plan = { acao: 'consultar', indicadores: ['total_prontuarios'], inicio: '', fim: '', filtros: filters };
const done = buildActivity('agenda', { responsavel: 'Equipe de teste', observacao: 'Não expor', tipo: 'Retorno', hora: '', situacao: 'realizado', data: '2026-10-31', dataConclusao: '2026-11-05' }, null, 'teste');
const cases = [
  { key: 'a', data: { numeroProntuario: '1', cor: 'preto', tipoViolencia: 'Violência Física; Violência Psicológica', situacaoAtual: 'ativo', dataEntrada: '2026-11-01', agenda_a: done, agenda_b: done } },
  { key: 'b', data: { numeroProntuario: '2', cor: 'pardo', tipoViolencia: 'Violência Física', dataEntrada: '2026-11-01' } },
  { key: 'c', data: { numeroProntuario: '3', cor: 'Preta', tipoViolencia: 'Violência Física', situacaoAtual: 'suspenso', dataEntrada: '2026-10-01' } },
  { key: 'd', data: { numeroProntuario: '4', cor: '', tipoViolencia: 'Violência Física', dataEntrada: '2026-11-01' } },
  { key: 'e', data: { numeroProntuario: '5', cor: 'branco', tipoViolencia: 'Violência Física', dataEntrada: '2026-11-01' } },
  { key: 'f', data: { numeroProntuario: '6', cor: 'valor inválido', tipoViolencia: 'Violência Física', dataEntrada: '2026-11-01' } }
];

test('violence and race filters intersect; pardo is only included when explicitly requested', () => {
  const selection = selectCases(cases, validateFilters(filters));
  assert.deepEqual(selection.selected.map(item => item.key), ['a', 'c']);
  assert.deepEqual(selection.uncertain.map(item => item.key), ['d', 'f']);
  const answer = answerPlannedQuestion(plan, cases);
  assert.match(answer, /Total de prontuários: 2/);
  assert.match(answer, /Raça\/cor: Preto\(a\)/);
  assert.match(answer, /2 prontuários com dados incompletos ou inválidos/);
  assert.equal(selectCases(cases, [filters[0], filter('cor', ['preto', 'pardo'])]).selected.length, 3);
  assert.equal(selectCases(cases, [filters[0], filters[1], filter('situacaoAtual', ['ativo'])]).selected.length, 1);
  assert.doesNotMatch(answer, /Não expor/);
});

test('multiple violence categories support AND and OR without counting a record twice', () => {
  assert.equal(selectCases(cases, [filter('tipoViolencia', ['fisica', 'psicologica'], 'todos')]).selected.length, 1);
  assert.equal(selectCases(cases, [filter('tipoViolencia', ['fisica', 'psicologica'])]).selected.length, 6);
  const distribution = answerPlannedQuestion({ ...plan, filtros: [], agruparPor: 'tipoViolencia' }, cases);
  assert.match(distribution, /Violência Física: 6 prontuários existentes/);
  assert.match(distribution, /Violência Psicológica: 1 prontuário existente/);
  assert.match(distribution, /soma dos grupos pode superar/);
});

test('case filters apply to linked appointments; each metric keeps its own date', () => {
  const dated = { ...plan, indicadores: ['entradas', 'atendimentos'], inicio: '2026-11-01', fim: '2026-11-16' };
  const answer = answerPlannedQuestion(dated, cases);
  assert.match(answer, /entrada no serviço: 1/);
  assert.match(answer, /Atendimentos realizados: 2/);
  assert.equal(selectCases(cases, [filter('cor', ['nao_informado'])]).selected.length, 1);
});

test('legacy sheet categories are read without inferring race from names or narratives', () => {
  assert.deepEqual(categoryValues({ cor: 'Preto (a)' }, 'cor'), ['preto']);
  assert.deepEqual(categoryValues({ dadosPlanilha: JSON.stringify({ COR: 'Preto(a)' }) }, 'cor'), ['preto']);
  assert.deepEqual(categoryValues({ nomeCriad: 'Pessoa negra', detalheSituacao: 'raça preta' }, 'cor'), ['nao_informado']);
  assert.deepEqual(categoryValues({ cor: '', dadosPlanilha: JSON.stringify({ COR: 'preto' }) }, 'cor'), ['nao_informado']);
  const unknown = [{ key: 'z', data: { cor: 'preto', tipoViolencia: 'Violência de categoria não reconhecida' } }];
  assert.equal(selectCases(unknown, filters).selected.length, 0);
  assert.equal(selectCases(unknown, filters).uncertain.length, 1);
});

test('unknown fields, arbitrary operators and invalid category values are rejected', () => {
  for (const invalid of [filter('nomeCriad', ['Nome']), filter('__proto__', ['x']), filter('cor', ['categoria inventada']), filter('cor', ['preto', 'pardo'], 'todos'), { ...filters[0], executar: 'excluir' }]) {
    assert.throws(() => validateFilters([invalid]));
  }
  assert.throws(() => validatePlan({ ...plan, agruparPor: 'responsavelCpf' }));
  assert.throws(() => validatePlan({ ...plan, filtros: [filters[0], filters[0]] }));
});

test('institutional answers cite sources and distinguish missing data, unsupported queries and scope', () => {
  const knowledge = topic => answerPlannedQuestion({ acao: 'conhecimento', indicadores: [], inicio: '', fim: '', tema: topic }, []);
  assert.match(knowledge('proteja'), /SJDH e Humana Brasil/);
  assert.match(knowledge('proteja'), /https:\/\/www.ba.gov.br\/justica\/proteja/);
  assert.match(knowledge('localizacao'), /Pedro Júlio Barbuda/);
  assert.match(knowledge('localizacao'), /30\/06\/2026/);
  assert.doesNotMatch(knowledge('proteja'), /3 mil|324 crianças/);
  const response = action => answerPlannedQuestion({ acao: action, indicadores: [], inicio: '', fim: '' }, cases);
  assert.match(response('informacao_ausente'), /pertinente ao serviço/);
  assert.match(response('consulta_indisponivel'), /pertinente ao serviço/);
  assert.match(response('acesso_indisponivel'), /autenticação e verificação/);
  assert.match(response('fora_escopo'), /foge do escopo/);
  assert.throws(() => knowledge('tema_inventado'));
});

// Resposta objetiva: o exemplo do usuário fica em duas frases, preservando a lacuna dos dados.
test('active cases with requested return lead with the exact count and a short exclusion note', () => {
  const records = Array.from({ length: 69 }, (_, index) => ({ key: String(index), data: index < 65
    ? { situacaoAtual: 'ativo', retornoSolicitado: 'sim' } : { situacaoAtual: 'ativo' } }));
  const query = { acao: 'consultar', indicadores: ['total_prontuarios'], inicio: '', fim: '', filtros: [filter('situacaoAtual', ['ativo']), filter('retornoSolicitado', ['sim'])] };
  const answer = answerPlannedQuestion(query, records);
  assert.equal(answer, '65 prontuários ativos com retorno solicitado.\n\n4 prontuários com dados incompletos ou inválidos ficaram fora da contagem.');
  assert.match(answerPlannedQuestion(query, records.slice(0, 1)), /^1 prontuário ativo com retorno solicitado\.$/);
  const summary = answerPlannedQuestion({ ...query, acao: 'resumir' }, records);
  assert.match(summary, /Situação do prontuário: Ativo/);
  assert.match(summary, /Retorno solicitado: Sim/);
});
