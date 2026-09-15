(function () {
  const slideshow = document.getElementById('hero-slideshow');
  const dotsWrap = document.getElementById('hero-dots');
  const valueLabel = document.getElementById('hero-value');
  const media = slideshow?.closest('.hero__media');
  const arrows = media?.querySelectorAll('[data-hero-direction]') || [];
  const status = media?.querySelector('.hero__carousel-status');
  if (!slideshow || !dotsWrap) return;

  const slides = [...slideshow.querySelectorAll('.hero__slide')];
  if (slides.length <= 1) return;

  let current = 0;
  let timer = null;
  let isVisible = true;
  let requested = 0;
  let isHovered = false;
  let isFocused = false;
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
    dot.setAttribute('aria-label', `Ir para imagem ${i + 1} — ${VALUES[i]}`);
    if (i === 0) dot.classList.add('is-active');
    if (i === 0) dot.setAttribute('aria-current', 'true');
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
    const request = ++requested;
    if (isManual) clearTimeout(timer);
    const image = hydrateSlide(index);

    if (image && !image.complete) {
      try {
        await image.decode();
      } catch {
        // O navegador ainda pode exibir a imagem quando o decode assíncrono
        // não estiver disponível ou for interrompido.
      }
    }

    if (requested !== request) return;
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('is-active');
    dots[current].removeAttribute('aria-current');
    current = index;
    slides[current].classList.add('is-active');
    slides[current].removeAttribute('aria-hidden');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-current', 'true');
    updateValue(current);
    if (isManual) {
      if (status) status.textContent = `Imagem ${current + 1} de ${slides.length}: ${slides[current].querySelector('img')?.alt || VALUES[current]}`;
      schedule();
    }
  }

  async function next() {
    await goTo((current + 1) % slides.length, false);
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = null;

    if (reducedMotion.matches || document.hidden || !isVisible || isHovered || isFocused) return;
    timer = window.setTimeout(() => void next(), INTERVAL);
  }

  arrows.forEach((arrow) => {
    arrow.hidden = false;
    arrow.addEventListener('click', () => {
      const direction = Number(arrow.dataset.heroDirection);
      void goTo((current + direction + slides.length) % slides.length, true);
    });
  });

  media?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    void goTo((current + direction + slides.length) % slides.length, true);
  });
  media?.addEventListener('pointerenter', () => { isHovered = true; schedule(); });
  media?.addEventListener('pointerleave', () => { isHovered = false; schedule(); });
  media?.addEventListener('focusin', () => { isFocused = true; schedule(); });
  media?.addEventListener('focusout', (event) => {
    isFocused = media.contains(event.relatedTarget);
    schedule();
  });

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
