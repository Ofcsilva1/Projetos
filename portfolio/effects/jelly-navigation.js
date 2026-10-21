/* Jelly Radio inspired chips. Anchors stay anchors; filters stay toggle buttons.
 * Native Animation API provides a short swell and neighbour response.
 */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 960px)');
  const groups = [
    {root:document.querySelector('#main-navigation'), selector:'a', attr:'aria-current', value:'location'},
    {root:document.querySelector('#project-filters'), selector:'button', attr:'aria-pressed', value:'true'}
  ];
  groups.forEach(({root,selector,attr,value}) => {
    const chips = [...root.querySelectorAll(selector)];
    root.classList.add('jelly-group');
    if(selector==='a') root.classList.add('jelly-nav');
    chips.forEach(chip => {
      chip.classList.add('jelly-chip');
      const skin=document.createElement('span');skin.className='jelly-skin';
      while(chip.firstChild) skin.append(chip.firstChild);
      chip.append(skin);
    });
    let previous=-2;
    let animations=[];
    const apply = (animate=false) => {
      const selected=chips.findIndex(chip=>chip.getAttribute(attr)===value);
      const changed=previous!==selected; previous=selected;
      animations.forEach(animation=>animation.cancel());animations=[];
      chips.forEach((chip,index) => {
        const on=index===selected;
        chip.dataset.jellyActive=String(on);
        const shift=selected<0||compact.matches?0:Math.sign(index-selected)*3;
        chip.style.setProperty('--jelly-shift',`${shift}px`);
        if (!animate||!changed||reduce.matches||document.documentElement.classList.contains('effects-paused')) return;
        const skin=chip.querySelector('.jelly-skin');
        const frames=on?[
          {transform:'scale(.97,1.01)'},{transform:'scale(1.09,.96)',offset:.35},{transform:'scale(1.025,1.035)',offset:.7},{transform:'scale(1.035)'}
        ]:[{transform:'scale(.99)'},{transform:'scale(.96,1.025)',offset:.4},{transform:'scale(1)'}];
        animations.push(skin.animate(frames,{duration:on?470:340,delay:Math.min(Math.abs(index-selected),2)*18,easing:'cubic-bezier(.2,.8,.3,1)'}));
      });
    };
    const observer=new MutationObserver(()=>apply(true));
    observer.observe(root,{subtree:true,attributes:true,attributeFilter:[attr]});
    compact.addEventListener('change',()=>apply());
    reduce.addEventListener('change',()=>apply());
    document.addEventListener('portfolio-effectschange',()=>apply());
    apply();
  });
})();
