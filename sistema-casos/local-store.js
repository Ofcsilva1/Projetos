// Demonstration storage: no credentials, network, or shared database.
const STORAGE_KEY = 'nexo-demo-casos-v1';
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
try {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed.casos !== 'object' || parsed.casos === null || Array.isArray(parsed.casos)) throw new Error('invalid-data');
    data = parsed;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
} catch {
  persistent = false;
  notice = 'Armazenamento indisponível: alterações duram apenas até recarregar. Exporte para guardar.';
}
export const storageNotice = notice;
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
  const value = update(clone(valueAt(path)));
  if (value === undefined) return {committed:false};
  const next = clone(data);
  const parts = path.split('/');
  let target = next;
  for (const key of parts.slice(0,-1)) target = target[key] ??= {};
  if (value === null) delete target[parts.at(-1)];
  else target[parts.at(-1)] = clone(value);
  // Persist before notifying: failed storage leaves the prior dataset intact.
  if (persistent) sessionStorage.setItem(STORAGE_KEY,JSON.stringify(next));
  data = next;
  listeners.forEach(listener=>listener());
  return {committed:true,snapshot:snapshot(value)};
}
export function resetDemo() {
  const next = examples();
  if (persistent) sessionStorage.setItem(STORAGE_KEY,JSON.stringify(next));
  data = next;
  listeners.forEach(listener=>listener());
}
