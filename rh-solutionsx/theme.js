(function(){
 const root=document.documentElement;
 let saved;
 try{saved=localStorage.getItem('rh-solutionsx-theme')}catch{}
 const system=matchMedia('(prefers-color-scheme: dark)');
 const setTheme=theme=>{root.dataset.theme=theme;root.style.colorScheme=theme;const button=document.getElementById('theme-toggle');if(button){button.setAttribute('aria-pressed',String(theme==='dark'));button.setAttribute('aria-label',theme==='dark'?'Ativar modo claro':'Ativar modo escuro');button.innerHTML=(theme==='dark'?'<span aria-hidden="true">☀</span> Modo claro':'<span aria-hidden="true">☾</span> Modo escuro')}};
 setTheme(saved==='light'||saved==='dark'?saved:system.matches?'dark':'light');
 document.addEventListener('DOMContentLoaded',()=>{setTheme(root.dataset.theme);document.getElementById('theme-toggle').onclick=()=>{const theme=root.dataset.theme==='dark'?'light':'dark';setTheme(theme);try{localStorage.setItem('rh-solutionsx-theme',theme)}catch{}}});
 system.addEventListener('change',e=>{let preference;try{preference=localStorage.getItem('rh-solutionsx-theme')}catch{}if(!preference)setTheme(e.matches?'dark':'light')});
})();
