/* Flip Card interaction inspired by React Bits. Native HTML/CSS, no React runtime.
 * Click/keyboard flip, subtle pointer tilt; no drag gesture that competes with mobile scroll.
 */
(() => {
  const card = document.querySelector('.profile-card');
  const inner = card.querySelector('.profile-card-inner');
  const front = card.querySelector('.profile-front');
  const back = card.querySelector('.profile-back');
  const open = card.querySelector('.flip-card-open');
  const close = card.querySelector('.flip-card-close');
  const heading = card.querySelector('#profile-card-title');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let flipped = false, frame = 0, pointer = null;
  const resetTilt = () => { cancelAnimationFrame(frame); frame=0; inner.style.removeProperty('--tilt-x'); inner.style.removeProperty('--tilt-y'); };
  const flip = shown => {
    flipped = shown; resetTilt();
    card.classList.toggle('is-flipped',shown);
    open.setAttribute('aria-expanded',String(shown));
    front.inert = shown; front.setAttribute('aria-hidden',String(shown));
    back.inert = !shown; back.setAttribute('aria-hidden',String(!shown));
    if (shown) heading.focus({preventScroll:true});
    else open.focus({preventScroll:true});
  };
  open.hidden = false;
  open.addEventListener('click',()=>flip(true));
  close.addEventListener('click',()=>flip(false));
  card.addEventListener('keydown',event=>{if(event.key==='Escape'&&flipped){event.preventDefault();flip(false);}});
  card.addEventListener('pointermove',event=>{
    if (!fine.matches || reduce.matches || document.documentElement.classList.contains('effects-paused') || flipped) return;
    pointer={x:event.clientX,y:event.clientY};
    if(frame) return;
    frame=requestAnimationFrame(()=>{
      frame=0;
      const bounds=card.getBoundingClientRect();
      const x=(pointer.x-bounds.left)/bounds.width-.5;
      const y=(pointer.y-bounds.top)/bounds.height-.5;
      inner.style.setProperty('--tilt-x',`${-y*6}deg`);
      inner.style.setProperty('--tilt-y',`${x*6}deg`);
    });
  },{passive:true});
  card.addEventListener('pointerleave',resetTilt);
  document.addEventListener('portfolio-effectschange',resetTilt);
  reduce.addEventListener('change',resetTilt);
})();
