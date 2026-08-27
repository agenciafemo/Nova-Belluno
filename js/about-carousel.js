(function () {
  const carousel = document.querySelector('[data-about-carousel]');
  if (!carousel) return;

  const mainFigure = carousel.querySelector('.about__image--primary');
  const mainImage = document.getElementById('about-carousel-main-image');
  const nextButton = document.getElementById('about-carousel-next');
  const nextImage = document.getElementById('about-carousel-next-image');
  const status = carousel.querySelector('.about__carousel-status');

  if (!mainFigure || !mainImage || !nextButton || !nextImage || !status) return;

  const slides = [
    {
      src: '/assets/img/hero/optimized/about-05-960.webp',
      alt: 'Pessoa idosa acompanhada por uma profissional em uma área verde',
      position: '67% center'
    },
    {
      src: '/assets/img/hero/optimized/about-07-960.webp',
      alt: 'Área externa arborizada e acessível da Nova Belluno',
      position: '56% center'
    },
    {
      src: '/assets/img/hero/optimized/about-03-960.webp',
      alt: 'Caminho entre árvores e áreas verdes da Nova Belluno',
      position: 'center'
    },
    {
      src: '/assets/img/hero/optimized/about-04-960.webp',
      alt: 'Fachada e acesso principal da Nova Belluno',
      position: 'center'
    },
    {
      src: '/assets/img/hero/optimized/about-06-960.webp',
      alt: 'Pessoa idosa contemplando um jardim tranquilo e arborizado',
      position: 'center'
    }
  ];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentIndex = 0;
  let isAnimating = false;
  let activeAnimation = null;
  let activeFlight = null;
  let activeIncomingIndex = null;

  slides.forEach((slide) => {
    const image = new Image();
    image.src = slide.src;
  });

  function applySlide(image, slide) {
    image.src = slide.src;
    image.alt = slide.alt;
    image.style.objectPosition = slide.position;
  }

  function finishSwap(incomingIndex) {
    const previewIndex = (incomingIndex + 1) % slides.length;

    currentIndex = incomingIndex;
    applySlide(mainImage, slides[currentIndex]);
    applySlide(nextImage, slides[previewIndex]);
    nextButton.setAttribute('aria-label', `Mostrar próxima imagem: ${slides[previewIndex].alt}`);
    status.textContent = `Imagem ${currentIndex + 1} de ${slides.length}: ${slides[currentIndex].alt}`;
    carousel.classList.remove('is-transitioning');
    nextButton.disabled = false;
    isAnimating = false;
  }

  function settleActiveSwap() {
    if (!isAnimating || activeIncomingIndex === null) return;

    const incomingIndex = activeIncomingIndex;
    const flight = activeFlight;

    activeAnimation = null;
    activeFlight = null;
    activeIncomingIndex = null;

    flight?.remove();
    finishSwap(incomingIndex);
  }

  function forceCompleteActiveSwap() {
    if (!isAnimating || activeIncomingIndex === null) return;

    const animation = activeAnimation;
    settleActiveSwap();

    if (animation && animation.playState !== 'idle' && animation.playState !== 'finished') {
      animation.cancel();
    }
  }

  function swapInstantly(incomingIndex) {
    carousel.classList.add('is-transitioning');
    finishSwap(incomingIndex);
  }

  function showNextSlide() {
    if (isAnimating) return;

    const incomingIndex = (currentIndex + 1) % slides.length;
    isAnimating = true;
    nextButton.disabled = true;

    if (reducedMotion.matches || typeof nextImage.animate !== 'function') {
      swapInstantly(incomingIndex);
      return;
    }

    const containerRect = carousel.getBoundingClientRect();
    const start = nextButton.getBoundingClientRect();
    const end = mainFigure.getBoundingClientRect();
    const nextStyles = window.getComputedStyle(nextButton);
    const nextImageStyles = window.getComputedStyle(nextImage);
    const mainStyles = window.getComputedStyle(mainFigure);
    const flight = nextImage.cloneNode();
    const startLeft = start.left - containerRect.left;
    const startTop = start.top - containerRect.top;
    const endLeft = end.left - containerRect.left;
    const endTop = end.top - containerRect.top;
    const translateX = endLeft - startLeft;
    const translateY = endTop - startTop;
    const scaleX = end.width / start.width;
    const scaleY = end.height / start.height;

    flight.removeAttribute('id');
    flight.removeAttribute('loading');
    flight.removeAttribute('decoding');
    flight.alt = '';
    flight.className = 'about__carousel-flight';
    flight.setAttribute('aria-hidden', 'true');
    flight.style.left = `${startLeft}px`;
    flight.style.top = `${startTop}px`;
    flight.style.width = `${start.width}px`;
    flight.style.height = `${start.height}px`;
    flight.style.border = nextStyles.border;
    flight.style.borderRadius = nextStyles.borderRadius;
    flight.style.objectPosition = nextImageStyles.objectPosition;

    carousel.appendChild(flight);
    carousel.classList.add('is-transitioning');
    activeFlight = flight;
    activeIncomingIndex = incomingIndex;

    let animation;

    try {
      animation = flight.animate([
        {
          transform: 'translate3d(0, 0, 0) scale(1, 1)',
          borderWidth: nextStyles.borderWidth,
          borderRadius: nextStyles.borderRadius,
          opacity: 1
        },
        {
          transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
          borderWidth: '0px',
          borderRadius: mainStyles.borderRadius,
          opacity: 1
        }
      ], {
        duration: 620,
        easing: 'cubic-bezier(.22, .61, .36, 1)',
        fill: 'forwards'
      });
    } catch (_error) {
      settleActiveSwap();
      return;
    }

    activeAnimation = animation;

    animation.addEventListener('finish', () => {
      settleActiveSwap();
    }, { once: true });

    animation.addEventListener('cancel', () => {
      settleActiveSwap();
    }, { once: true });
  }

  nextButton.addEventListener('click', showNextSlide);
  window.addEventListener('resize', forceCompleteActiveSwap, { passive: true });
  window.addEventListener('pagehide', forceCompleteActiveSwap);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) forceCompleteActiveSwap();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) forceCompleteActiveSwap();
  });
})();
