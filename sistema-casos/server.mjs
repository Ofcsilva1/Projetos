// Servidor do laboratório: entrega a interface e mantém o arquivo .env privado.
import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomBytes } from 'node:crypto';
import { ApiError, GEMINI_MODEL, interpretQuestion } from './gemini.server.js';
import { validatePlan } from './nexus-plan.js';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff' };

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}

// Corpo limitado: aceita somente a pergunta e um plano anterior, sem prontuários ou arquivos.
async function readQuestion(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 12000) throw new ApiError(413, 'A pergunta excede o tamanho permitido.');
    chunks.push(chunk);
  }
  let value;
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ApiError(400, 'Pergunta inválida.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some(key => !['question', 'previousPlan'].includes(key))
    || typeof value.question !== 'string' || !value.question.trim() || value.question.length > 600) throw new ApiError(400, 'Escreva uma pergunta com até 600 caracteres.');
  if (value.previousPlan != null) {
    try { value.previousPlan = validatePlan(value.previousPlan); } catch { throw new ApiError(400, 'O contexto da conversa é inválido. Limpe a conversa e tente novamente.'); }
  }
  return { question: value.question.trim(), previousPlan: value.previousPlan };
}

export function createLabServer({ apiKey = '', fetchImpl = fetch, maxPerMinute = 10 } = {}) {
  const token = randomBytes(24).toString('hex');
  const configured = apiKey.trim().length >= 20 && !apiKey.includes('cole_sua_chave');
  let windowStart = Date.now(), requests = 0, busy = false;
  return http.createServer(async (req, res) => {
    const allowedHosts = [`127.0.0.1:${req.socket.localPort}`, `localhost:${req.socket.localPort}`];
    if (!allowedHosts.includes(req.headers.host)) return json(res, 403, { error: 'Endereço de acesso não permitido.' });
    const origin = `http://${req.headers.host}`;
    if (req.headers.origin && req.headers.origin !== origin) return json(res, 403, { error: 'Origem não permitida.' });
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, origin).pathname); } catch { return json(res, 400, { error: 'Endereço inválido.' }); }
    try {
      if (pathname === '/api/nexus/status' && req.method === 'GET') return json(res, 200, { configured, model: GEMINI_MODEL, token });
      if (pathname === '/api/nexus' && req.method === 'POST') {
        if (req.headers.origin !== origin || req.headers['x-nexo-token'] !== token) throw new ApiError(403, 'Atualize a página para autorizar a consulta local.');
        if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new ApiError(415, 'Envie a pergunta no formato JSON.');
        if (!configured) throw new ApiError(503, 'Preencha GEMINI_API_KEY no arquivo .env e reinicie com npm start.');
        if (busy) throw new ApiError(429, 'Uma consulta já está em andamento. Aguarde antes de enviar outra.');
        const question = await readQuestion(req);
        if (Date.now() - windowStart >= 60000) { windowStart = Date.now(); requests = 0; }
        if (requests >= maxPerMinute) throw new ApiError(429, 'Limite local de consultas atingido. Aguarde um minuto.');
        // Reconfere após a leitura: duas requisições simultâneas não podem ultrapassar o limite.
        if (busy) throw new ApiError(429, 'Uma consulta já está em andamento. Aguarde.');
        busy = true;
        requests++;
        try {
          const plan = await interpretQuestion({ ...question, apiKey, fetchImpl });
          return json(res, 200, { plan, model: GEMINI_MODEL });
        } finally { busy = false; }
      }
      if (pathname.startsWith('/api/')) return json(res, 404, { error: 'Rota não encontrada.' });
      if (!['GET', 'HEAD'].includes(req.method)) throw new ApiError(405, 'Método não permitido.');
      // Arquivos públicos: exclui segredos, servidor, dependências e diretórios de teste.
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      const parts = relative.split('/');
      const extension = path.extname(relative);
      if (parts.some(part => !part || part.startsWith('.') || part.includes('\\') || part.includes(':'))
        || !MIME[extension] || relative.toLowerCase().endsWith('.server.js')
        || (parts.length > 1 && parts[0] !== 'vendor')) throw new ApiError(404, 'Arquivo não encontrado.');
      const filename = await realpath(path.join(ROOT, relative));
      if (!filename.startsWith(ROOT)) throw new ApiError(404, 'Arquivo não encontrado.');
      const body = await readFile(filename);
      res.writeHead(200, { 'Content-Type': MIME[extension], 'Content-Length': body.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' });
      return res.end(req.method === 'HEAD' ? undefined : body);
    } catch (error) {
      return json(res, error instanceof ApiError ? error.status : error?.code === 'ENOENT' ? 404 : 500, {
        error: error instanceof ApiError ? error.message : error?.code === 'ENOENT' ? 'Arquivo não encontrado.' : 'Não foi possível concluir a solicitação.'
      });
    }
  });
}

// Inicialização: atende apenas neste computador e nunca imprime a chave nos logs.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const server = createLabServer({ apiKey: process.env.GEMINI_API_KEY || '' });
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? 'A porta 8000 está ocupada. Encerre o servidor Python com Ctrl+C e execute npm start novamente.' : 'Não foi possível iniciar o servidor local.');
    process.exitCode = 1;
  });
  server.listen(8000, '127.0.0.1', () => console.log('Nexo Laboratório: http://127.0.0.1:8000/ — Ctrl+C para encerrar.'));
}
