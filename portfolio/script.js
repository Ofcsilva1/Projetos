const dialog = document.querySelector('.image-dialog');
const expandedImage = document.querySelector('#expanded-image');
const imageCaption = document.querySelector('#image-caption');

if (dialog && typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-lightbox]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      expandedImage.src = link.href;
      expandedImage.alt = link.querySelector('img').alt;
      imageCaption.textContent = link.dataset.caption;
      dialog.showModal();
    });
  });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}

if ('IntersectionObserver' in window) {
  const navigationLinks = document.querySelectorAll('.site-header nav a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-15% 0px -65% 0px', threshold: 0});
  document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
}
