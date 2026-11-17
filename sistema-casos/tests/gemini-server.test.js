// Integração sem gastos: usa chave e respostas sintéticas, sem chamadas reais ao Google.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createLabServer } from '../server.mjs';
import { interpretQuestion, GEMINI_MODEL } from '../gemini.server.js';
import { answerPlannedQuestion, validatePlan } from '../nexus-plan.js';
import { buildActivity } from '../workflow-core.js';

const key = 'chave-ficticia-somente-para-testes';
const totalPlan = { acao: 'consultar', indicadores: ['total_prontuarios'], inicio: '', fim: '' };
const geminiReply = plan => new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(plan) }] } }] }), { status: 200 });

async function fixture(options = {}) {
  const server = createLabServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  const status = await (await fetch(`${origin}/api/nexus/status`)).json();
  const post = (body, headers = {}) => fetch(`${origin}/api/nexus`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Nexo-Token': status.token, ...headers }, body: JSON.stringify(body) });
  const close = async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); };
  return { origin, status, post, close };
}

test('server returns a validated plan and sends no records or API key to the browser', async () => {
  const calls = [];
  const app = await fixture({ apiKey: key, fetchImpl: async (url, options) => { calls.push({ url, options }); return geminiReply(totalPlan); } });
  try {
    assert.equal(app.status.configured, true);
    assert.equal(JSON.stringify(app.status).includes(key), false);
    const response = await app.post({ question: 'Quantos prontuários temos?' });
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.deepEqual(data.plan, totalPlan);
    assert.equal(JSON.stringify(data).includes(key), false);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.headers['x-goog-api-key'], key);
    assert.equal(calls[0].url.includes(key), false);
    assert.ok(calls[0].url.endsWith(`${GEMINI_MODEL}:generateContent`));
    const sent = JSON.parse(calls[0].options.body);
    assert.match(sent.contents[0].parts[0].text, /Quantos prontuários temos/);
    assert.equal(sent.tools, undefined);
  } finally { await app.close(); }
});

test('private files, cross-origin calls, oversized questions and unexpected records are blocked before provider use', async () => {
  let calls = 0;
  const app = await fixture({ apiKey: key, fetchImpl: async () => { calls++; return geminiReply(totalPlan); } });
  try {
    for (const filename of ['.env', '%2eenv', '.env.local', 'server.mjs', 'gemini.server.js', 'GEMINI.SERVER.js', 'package.json', 'node_modules/playwright/package.json', 'tests/gemini-server.test.js']) {
      assert.equal((await fetch(`${app.origin}/${filename}`)).status, 404, filename);
    }
    assert.equal((await fetch(`${app.origin}/`)).status, 200);
    assert.equal((await app.post({ question: 'Total?' }, { Origin: 'https://exemplo.invalid' })).status, 403);
    assert.equal((await app.post({ question: 'Total?' }, { 'X-Nexo-Token': 'invalido' })).status, 403);
    assert.equal((await app.post({ question: 'Total?', casos: [{ nome: 'Não enviar' }] })).status, 400);
    assert.equal((await app.post({ question: 'a'.repeat(601) })).status, 400);
    assert.equal(calls, 0);
  } finally { await app.close(); }
});

test('missing key, provider quota and local limit give actionable errors without automatic retries', async () => {
  const empty = await fixture();
  try {
    assert.equal(empty.status.configured, false);
    assert.equal((await empty.post({ question: 'Total?' })).status, 503);
  } finally { await empty.close(); }
  let calls = 0;
  const limited = await fixture({ apiKey: key, maxPerMinute: 1, fetchImpl: async () => { calls++; return new Response('private upstream error', { status: 429 }); } });
  try {
    const first = await limited.post({ question: 'Total?' });
    assert.equal(first.status, 429);
    assert.match((await first.json()).error, /cota do Gemini/);
    const next = await limited.post({ question: 'Total?' });
    assert.equal(next.status, 429);
    assert.match((await next.json()).error, /Limite local/);
    assert.equal(calls, 1);
  } finally { await limited.close(); }
});

test('invalid model output and connection errors do not expose raw provider errors', async () => {
  await assert.rejects(interpretQuestion({ question: 'Total?', apiKey: key, fetchImpl: async () => geminiReply({ ...totalPlan, execute: 'excluir' }) }), error => error.status === 502);
  await assert.rejects(interpretQuestion({ question: 'Total?', apiKey: key, fetchImpl: async () => { throw new Error(key); } }), error => error.status === 503 && !error.message.includes(key));
  await assert.rejects(interpretQuestion({ question: 'Total?', apiKey: key, fetchImpl: async () => new Response(key, { status: 403 }) }), error => !error.message.includes(key));
  await assert.rejects(interpretQuestion({ question: 'Total?', apiKey: key, fetchImpl: async () => new Response(JSON.stringify({ error: { message: `Response schema too complex: ${key}` } }), { status: 400 }) }), error => error.status === 502 && !error.message.includes(key));
});

test('total without dates, a yearly interval and refusals produce grounded local results', () => {
  const cases = [{ key: 'a', data: { numeroProntuario: '1', dataEntrada: '2026-11-01' } }, { key: 'b', data: { numeroProntuario: '2', dataEntrada: '2024-10-01' } }];
  assert.match(answerPlannedQuestion(totalPlan, cases), /Total de prontuários: 2/);
  assert.match(answerPlannedQuestion({ acao: 'consultar', indicadores: ['entradas'], inicio: '2025-11-17', fim: '2026-11-16' }, cases), /entrada no serviço: 1/);
  assert.match(answerPlannedQuestion({ acao: 'fora_escopo', indicadores: [], inicio: '', fim: '' }, cases), /foge do escopo/);
  assert.throws(() => validatePlan({ ...totalPlan, indicadores: ['excluir'] }));
  assert.throws(() => validatePlan({ ...totalPlan, inicio: '2026-11-01', fim: '2026-11-16' }));
  assert.throws(() => validatePlan({ ...totalPlan, indicadores: ['entradas'], inicio: '2026-02-30', fim: '2026-11-16' }));
});

// Resumos factuais: diferencia entrada, criação, atendimento e falta, sem inferir causas.
test('summary keeps all four counts and data gaps; definitions appear only when requested', () => {
  const activity = (situacao, data, dataConclusao = '') => buildActivity('agenda', {
    responsavel: 'Equipe fictícia', observacao: 'Relato que não deve aparecer', tipo: 'Retorno', hora: '', situacao, data, dataConclusao
  }, null, 'teste');
  const cases = [
    { key: 'a', data: { numeroProntuario: '1', dataEntrada: '2026-11-01', criadoEm: '2026-11-02T12:00:00Z', agenda_a: activity('realizado', '2026-10-30', '2026-11-03'), agenda_b: activity('nao_compareceu', '2026-11-04') } },
    { key: 'b', data: { numeroProntuario: '2', dataEntrada: '2026-10-01' } }
  ];
  const plan = { acao: 'resumir', indicadores: ['entradas', 'cadastros', 'atendimentos', 'faltas'], inicio: '2026-11-01', fim: '2026-11-16' };
  const answer = answerPlannedQuestion(plan, cases);
  assert.match(answer, /01\/11\/2026 a 16\/11\/2026/);
  assert.match(answer, /1 entrada no serviço/);
  assert.match(answer, /1 cadastro criado/);
  assert.match(answer, /1 atendimento realizado/);
  assert.match(answer, /1 falta registrada/);
  assert.match(answer, /1 prontuário sem data de criação/);
  assert.doesNotMatch(answer, /Fonte:|Importar uma ficha|causado por/);
  assert.doesNotMatch(answer, /Relato que não deve aparecer/);
  const definitions = answerPlannedQuestion({ acao: 'explicar', indicadores: ['entradas', 'cadastros'], inicio: '', fim: '' }, []);
  assert.match(definitions, /Importar uma ficha antiga/);
  assert.doesNotMatch(definitions, /Preciso que você esclareça/);
});
