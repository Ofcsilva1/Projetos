// Public demonstration credentials only. This screen is not a security boundary.
// No Firebase account, password or remote authentication is used.
document.addEventListener('DOMContentLoaded', () => {
  const email = 'visitante@exemplo.com';
  const password = 'NexoDemo2026';
  const entry = document.getElementById('auth-wrapper');
  const app = document.getElementById('app-wrapper');
  const form = document.getElementById('login-form');
  const username = document.getElementById('username');
  const secret = document.getElementById('password');
  const button = document.getElementById('btnLogin');
  const status = document.getElementById('auth-status');
  const show = document.getElementById('show-password');
  function prefill() {
    username.value = email;
    secret.value = password;
    show.checked = false;
    secret.type = 'password';
  }
  function ready() {
    button.disabled = false;
    button.textContent = 'Entrar na demonstração';
    status.textContent = '';
  }
  prefill();
  if (document.documentElement.dataset.demoReady === 'true') ready();
  document.addEventListener('demo:ready', ready);
  show.addEventListener('change', () => { secret.type = show.checked ? 'text' : 'password'; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (document.documentElement.dataset.demoReady !== 'true') return;
    if (username.value.trim() !== email || secret.value !== password) {
      status.textContent = 'Use o acesso demonstrativo: visitante@exemplo.com / NexoDemo2026.';
      return;
    }
    status.textContent = '';
    entry.hidden = true;
    app.hidden = false;
    document.getElementById('skip-to-login').hidden = true;
    document.getElementById('skip-to-content').hidden = false;
    document.getElementById('page-title').setAttribute('tabindex', '-1');
    document.getElementById('page-title').focus();
  });
  document.getElementById('btnDemoLogout').addEventListener('click', () => {
    if (!document.dispatchEvent(new Event('demo:logout-request', {cancelable:true}))) return;
    app.hidden = true;
    entry.hidden = false;
    document.getElementById('skip-to-content').hidden = true;
    document.getElementById('skip-to-login').hidden = false;
    prefill();
    document.getElementById('login-title').focus();
  });
});
