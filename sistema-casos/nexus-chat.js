// Conversa do laboratório: alterna consultas locais e interpretação pelo Gemini.
import { answerLocalQuestion } from './nexus-core.js';
// Plano validado: os números continuam sendo calculados com a base fictícia do navegador.
import { answerPlannedQuestion } from './nexus-plan.js';

export function setupNexusChat({ getCases }) {
  const form = document.getElementById('nexus-form');
  const input = document.getElementById('nexus-question');
  const log = document.getElementById('nexus-messages');
  const status = document.getElementById('nexus-status');
  const empty = document.getElementById('nexus-welcome');
  const mode = document.getElementById('nexus-mode');
  const modeLabel = document.getElementById('nexus-mode-label');
  const privacy = document.getElementById('nexus-privacy');
  const send = form.querySelector('[type="submit"]');
  let serverStatus = null, previousPlan = null, busy = false, sequence = 0, controller = null;
  // Publicação estática: só procura a API quando o projeto é executado localmente ou configurado como servidor.
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const localOnly = document.documentElement.dataset.nexusRuntime === 'static' && !isLocalhost;

  // Estado do chat: informa se a pergunta será interpretada localmente ou pelo Gemini.
  function updateMode() {
    const useAI = mode.value === 'gemini';
    modeLabel.textContent = useAI ? 'Gemini · interpretação com IA' : 'Consultas locais · sem IA';
    privacy.textContent = useAI
      ? 'Use somente dados fictícios. Sua pergunta será enviada ao Gemini; os prontuários permanecem neste navegador. Permissões por cargo ainda não implementadas.'
      : 'Use somente dados fictícios. Consulta neste navegador, sem envio a uma IA. Permissões por cargo ainda não implementadas.';
  }
  function setBusy(value) {
    busy = value;
    send.disabled = value;
    send.textContent = value ? 'Consultando…' : 'Consultar dados';
    input.readOnly = value;
    mode.disabled = value;
    log.setAttribute('aria-busy', String(value));
    document.querySelectorAll('[data-nexus-question]').forEach(button => { button.disabled = value; });
  }
  async function checkServer(signal = AbortSignal.timeout(3000)) {
    if (localOnly) return null;
    try {
      const response = await fetch('/api/nexus/status', { cache: 'no-store', signal });
      if (!response.ok) return null;
      const data = await response.json();
      return typeof data.configured === 'boolean' && typeof data.token === 'string' ? data : null;
    } catch { return null; }
  }
  mode.addEventListener('change', () => { previousPlan = null; updateMode(); });
  checkServer().then(data => {
    serverStatus = data;
    // Disponibilidade real: o Gemini só pode ser escolhido quando o servidor informa configuração presente.
    const aiOption = mode.querySelector('option[value="gemini"]');
    if (aiOption) {
      aiOption.disabled = !data?.configured;
      aiOption.textContent = data?.configured ? 'Gemini (IA)' : 'Gemini (requer servidor configurado)';
    }
    if (data?.configured && !busy && !log.children.length) mode.value = 'gemini';
    updateMode();
  });

  function appendMessage(author, text) {
    const article = document.createElement('article');
    article.className = `nexus-message nexus-message-${author === 'Você' ? 'user' : 'assistant'}`;
    const heading = document.createElement('h3');
    heading.textContent = author;
    const body = document.createElement('p');
    body.textContent = text;
    article.append(heading, body);
    log.append(article);
    // Limite simples: evita acumular uma conversa ilimitada na memória da página.
    while (log.children.length > 40) log.firstElementChild.remove();
    // Rolagem da conversa: acompanha a resposta sem deslocar a página inteira.
    log.scrollTop = log.scrollHeight;
  }

  // Envio e sugestões: cada pergunta usa a base atual completa, sem os filtros da listagem.
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const question = input.value.trim();
    if (!question) {
      status.textContent = 'Digite uma pergunta para consultar os dados.';
      input.focus();
      return;
    }
    empty.hidden = true;
    appendMessage('Você', question);
    // Campo de mensagem: limpa no envio; a pergunta permanece no histórico mesmo se a consulta falhar.
    input.value = '';
    const requestId = ++sequence;
    const currentCases = getCases();
    setBusy(true);
    try {
      if (mode.value === 'gemini') {
        controller = new AbortController();
        status.textContent = 'O Gemini está interpretando sua pergunta…';
        // Consulta a configuração a cada envio para reconhecer reinicializações do servidor.
        serverStatus = await checkServer(AbortSignal.any([controller.signal, AbortSignal.timeout(3000)]));
        if (requestId !== sequence) return;
        if (!serverStatus) throw new Error('Inicie o laboratório com npm start para usar o Gemini. O servidor Python oferece somente as consultas locais.');
        if (!serverStatus.configured) throw new Error('Preencha GEMINI_API_KEY no arquivo .env, salve e reinicie o servidor com npm start.');
        const response = await fetch('/api/nexus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Nexo-Token': serverStatus.token },
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]),
          // A base de prontuários nunca faz parte da requisição.
          body: JSON.stringify({ question, previousPlan })
        });
        const data = await response.json();
        if (requestId !== sequence) return;
        if (!response.ok) throw new Error(data.error || 'Não foi possível consultar o Gemini.');
        const answer = answerPlannedQuestion(data.plan, currentCases);
        appendMessage('Nexus · Gemini', answer);
        if (['consultar', 'resumir'].includes(data.plan.acao)) previousPlan = data.plan;
        status.textContent = 'Pergunta interpretada pelo Gemini; contagem calculada com a base do laboratório.';
      } else {
        appendMessage('Nexus · consulta local', answerLocalQuestion(question, currentCases));
        status.textContent = 'Resposta calculada com os registros atuais do laboratório.';
      }
    } catch (error) {
      if (requestId !== sequence) return;
      status.textContent = error.name === 'TimeoutError' ? 'A consulta demorou demais. Tente novamente.' : error.message || 'Falha na consulta. Tente novamente.';
    } finally {
      if (requestId === sequence) { controller = null; setBusy(false); input.focus({ preventScroll: true }); }
    }
  });
  document.querySelectorAll('[data-nexus-question]').forEach(button => {
    button.addEventListener('click', () => {
      input.value = button.dataset.nexusQuestion;
      form.requestSubmit();
    });
  });
  // Teclado do chat: Enter consulta e Shift+Enter permite escrever outra linha.
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  document.getElementById('nexus-clear').addEventListener('click', () => {
    // Limpeza durante uma requisição impede que uma resposta atrasada reapareça.
    sequence++;
    controller?.abort();
    previousPlan = null;
    setBusy(false);
    log.replaceChildren();
    empty.hidden = false;
    status.textContent = 'Conversa limpa. Os prontuários foram preservados.';
    input.value = '';
    input.focus();
  });
  // Saída: o histórico da conversa não é guardado nem mostrado na próxima entrada.
  document.addEventListener('demo:enter', () => {
    sequence++;
    controller?.abort();
    previousPlan = null;
    setBusy(false);
    log.replaceChildren();
    empty.hidden = false;
    input.value = '';
    status.textContent = '';
  });
}
