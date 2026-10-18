// Keep a useful recovery message if a local script cannot load or execute.
(() => {
 'use strict';
 let failed=false,ready=false;
 function update(){
  const status=document.getElementById('startup-status');
  if(!status)return;
  status.hidden=ready&&!failed;
  if(failed){
   status.setAttribute('role','alert');
   status.textContent='Não foi possível carregar o painel por completo. Recarregue a página para tentar novamente. Se o problema continuar, abra novamente o endereço original do dashboard.';
  }
 }
 addEventListener('error',event=>{
  if(event.target?.tagName==='SCRIPT'||event instanceof ErrorEvent){failed=true;update()}
 },true);
 addEventListener('rh-dashboard-ready',()=>{ready=true;update()});
 document.addEventListener('DOMContentLoaded',update);
})();
