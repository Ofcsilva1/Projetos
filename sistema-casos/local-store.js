// Base do laboratório: usa uma chave própria e não acessa o Firebase original.
export const STORAGE_KEY = 'nexo-laboratorio-casos-v1';
const LEGACY_KEY = 'nexo-demo-casos-v1';
const listeners = new Set();
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function examples() {
  return {casos: Object.fromEntries(Array.from({length:12}, (_,i) => [`exemplo-${i+1}`, {
    numeroProntuario: String(i+1).padStart(4,'0'),
    nomeCriad: `Pessoa fictícia ${String(i+1).padStart(2,'0')}`,
    responsavelNome: `Responsável fictício ${i+1}`,
    dataEntrada: `2026-${String((i%9)+1).padStart(2,'0')}-10`,
    situacaoAtual: ['ativo','ativo','suspenso','encerrado_com_protecao','encerrado_sem_protecao','nao_competencia'][i%6],
    tecnicosReferencia: `Equipe demonstrativa ${(i%3)+1}`,
    detalheOrigem: 'Registro de exemplo criado exclusivamente para demonstração.',
    outrasPendencias: 'Informação fictícia para explorar a interface.'
  }]))};
}
let data = examples();
let persistent = true;
let notice = '';
// Leitura segura: dados inválidos não são substituídos silenciosamente por exemplos.
function parseStored(value) {
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed.casos !== 'object' || parsed.casos === null || Array.isArray(parsed.casos)) throw new Error('invalid-data');
  return parsed;
}
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    data = parseStored(saved);
  } else {
    // Migração inicial: preserva a base da aba anterior, quando ela está disponível.
    let previous = null;
    try { previous = globalThis.sessionStorage?.getItem(LEGACY_KEY); } catch { /* A base nova funciona sem acesso à sessão antiga. */ }
    if (previous) data = parseStored(previous);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  notice = 'Base fictícia salva neste navegador e neste endereço. Fechar a aba não apaga os registros. Exporte uma cópia para backup.';
} catch {
  persistent = false;
  notice = 'Não foi possível abrir o armazenamento do laboratório. Esta sessão usa uma base temporária; alterações duram apenas até recarregar. Exporte para guardar. Os dados salvos anteriormente não foram substituídos.';
}
export const storageNotice = notice;
// Sincronização entre abas: uma gravação usa a versão mais recente da base.
function refreshStored() {
  if (!persistent) return;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) throw new Error('A base local foi removida. Recarregue antes de salvar.');
  data = parseStored(saved);
}
function notifyListeners() {
  listeners.forEach(listener => listener());
}
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (persistent && event.key === STORAGE_KEY && event.newValue) {
    try {
      data = parseStored(event.newValue);
      notifyListeners();
    } catch { /* Uma gravação inválida de outra aba não substitui a base em memória. */ }
  }
});
function withStorageLock(action) {
  return typeof window !== 'undefined' && globalThis.navigator?.locks
    ? navigator.locks.request(STORAGE_KEY, action)
    : Promise.resolve().then(action);
}
function valueAt(path) {
  if (path.startsWith('access/')) return {active:true,role:'administrador'};
  return path.split('/').filter(Boolean).reduce((obj,key)=>obj?.[key],data) ?? null;
}
function snapshot(value, key = null) {
  return {key, val:()=>clone(value), forEach:callback=>{
    for (const [childKey,child] of Object.entries(value || {})) if (callback(snapshot(child,childKey)) === true) break;
  }};
}
export const ref = (_database,path) => path;
export const get = async path => snapshot(valueAt(path));
export function onValue(path, callback, onError) {
  const listener = () => { try { callback(snapshot(valueAt(path))); } catch(error) { onError?.(error); } };
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}
export async function runTransaction(path, update) {
  if (!/^casos\/[^/]+(?:\/[^/]+)?$/.test(path)) throw new Error('Invalid local path');
  // Gravação protegida: serializa abas compatíveis e confirma o armazenamento antes de atualizar a tela.
  return withStorageLock(() => {
    refreshStored();
    const value = update(clone(valueAt(path)));
    if (value === undefined) return {committed:false};
    const next = clone(data);
    const parts = path.split('/');
    let target = next;
    for (const key of parts.slice(0,-1)) target = target[key] ??= {};
    if (value === null) delete target[parts.at(-1)];
    else target[parts.at(-1)] = clone(value);
    if (persistent) localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
    data = next;
    notifyListeners();
    return {committed:true,snapshot:snapshot(value)};
  });
}
// Restauração explícita: o botão da interface pede confirmação antes de chamar esta função.
export async function resetDemo() {
  return withStorageLock(() => {
    const next = examples();
    if (persistent) localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
    data = next;
    notifyListeners();
  });
}
