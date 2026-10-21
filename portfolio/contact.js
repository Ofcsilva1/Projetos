(() => {
  const dialog=document.querySelector('.email-dialog');
  if(!dialog || typeof dialog.showModal!=='function') return;
  const feedback=dialog.querySelector('.email-feedback');
  const copyButton=dialog.querySelector('#copy-email');
  const email='caiquereis2k@gmail.com';
  document.querySelectorAll('[data-email-open]').forEach(link=>link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey) return;
    event.preventDefault();feedback.textContent='';dialog.showModal();
  }));
  dialog.querySelector('.email-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog) return;
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom) dialog.close();
  });
  copyButton.addEventListener('click',async()=>{
    try {
      if(!navigator.clipboard?.writeText) throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      feedback.textContent='E-mail copiado. Cole no aplicativo que preferir.';
    } catch {
      const input=document.createElement('textarea');input.value=email;input.readOnly=true;
      input.style.position='fixed';input.style.opacity='0';dialog.append(input);input.select();
      const copied=document.execCommand('copy');input.remove();copyButton.focus();
      feedback.textContent=copied?'E-mail copiado. Cole no aplicativo que preferir.':'Selecione o endereço acima e copie para seu aplicativo de e-mail.';
    }
  });
})();
