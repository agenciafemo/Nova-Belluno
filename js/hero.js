(function () {
  const slideshow = document.getElementById('hero-slideshow');
  const dotsWrap = document.getElementById('hero-dots');
  const valueLabel = document.getElementById('hero-value');
  if (!slideshow || !dotsWrap) return;

  const slides = [...slideshow.querySelectorAll('.hero__slide')];
  if (slides.length <= 1) return;

  let current = 0;
  let timer = null;
  let isVisible = true;
  let requested = 0;
  const INTERVAL = 7000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const VALUES = [
    'Acolhimento',
    'Carinho',
    'Respeito',
    'Cuidado individualizado',
    'Presença',
    'Segurança',
    'Tranquilidade',
    'Bem-estar',
  ];

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir para imagem ${i + 1} — ${VALUES[i]}`);
    if (i === 0) dot.classList.add('is-active');
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => void goTo(i, true));
    dotsWrap.appendChild(dot);
  });

  const dots = [...dotsWrap.querySelectorAll('button')];

  function updateValue(index) {
    if (!valueLabel) return;
    valueLabel.textContent = VALUES[index] || VALUES[0];
    valueLabel.classList.remove('is-updating');
    void valueLabel.offsetWidth;
    valueLabel.classList.add('is-updating');
  }

  function hydrateSlide(index) {
    const image = slides[index]?.querySelector('img');
    if (!image || !image.dataset.src) return image;

    if (image.dataset.srcset) {
      image.srcset = image.dataset.srcset;
      delete image.dataset.srcset;
    }
    image.src = image.dataset.src;
    delete image.dataset.src;
    return image;
  }

  async function goTo(index, isManual) {
    requested = index;
    const image = hydrateSlide(index);

    if (image && !image.complete) {
      try {
        await image.decode();
      } catch {
        // O navegador ainda pode exibir a imagem quando o decode assíncrono
        // não estiver disponível ou for interrompido.
      }
    }

    if (requested !== index) return;
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
    updateValue(current);
    if (isManual) schedule();
  }

  async function next() {
    await goTo((current + 1) % slides.length, false);
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = null;

    if (reducedMotion.matches || document.hidden || !isVisible) return;
    timer = window.setTimeout(() => void next(), INTERVAL);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      schedule();
    }, { threshold: .15 });
    observer.observe(slideshow);
  }

  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  schedule();
})();
