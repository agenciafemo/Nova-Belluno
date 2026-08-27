(function () {
  const header = document.getElementById('site-header');
  if (!header) return;

  const THRESHOLD = 24; // px rolados até a barra virar sólida

  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
})();
