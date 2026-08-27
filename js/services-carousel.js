(function () {
  const root = document.getElementById('services-carousel');
  if (!root) return;

  const viewport = root.querySelector('.services-carousel__viewport');
  const track = root.querySelector('.services-carousel__track');
  const previousButton = root.querySelector('.services-carousel__nav--previous');
  const nextButton = root.querySelector('.services-carousel__nav--next');
  const pagination = root.querySelector('.services-carousel__pagination');
  const autoplayButton = root.querySelector('.services-carousel__autoplay');
  const countLabel = root.querySelector('.services-carousel__count');
  const currentTitle = root.querySelector('.services-carousel__current-title');
  const status = root.querySelector('.services-carousel__status');
  const originalSlides = Array.from(
    root.querySelectorAll('.service-showcase__slide')
  );

  if (!viewport || !track || !previousButton || !nextButton ||
      !pagination || !autoplayButton || !countLabel || !currentTitle ||
      !status || originalSlides.length < 2) return;

  const COUNT = originalSlides.length;
  const AUTOPLAY_DELAY = 4800;
  const AUTO_TRANSITION_DURATION = 1600;
  const MANUAL_DURATION = 680;
  const SWIPE_THRESHOLD = 0.12;
  const FLICK_THRESHOLD = 0.42;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const cloneBefore = originalSlides[COUNT - 1].cloneNode(true);
  const cloneAfter = originalSlides[0].cloneNode(true);

  [cloneBefore, cloneAfter].forEach((clone) => {
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('aria-current');
  });

  track.prepend(cloneBefore);
  track.append(cloneAfter);

  let renderedSlides = Array.from(
    track.querySelectorAll('.service-showcase__slide')
  );
  let pitch = 0;
  let position = 1;
  let activeIndex = 0;
  let motionFrame = null;
  let autoTimer = null;
  let motion = null;
  let pendingAutoTarget = null;
  let pauseAfterTransition = false;
  let drag = null;
  let hovering = false;
  let focusWithin = false;
  let playFocusOverride = false;
  let sectionVisible = true;
  let userOptedIntoAutoplay = false;
  let userPaused = !finePointer.matches;

  const dots = originalSlides.map((slide, index) => {
    const title = slide.querySelector('.service-showcase__title')
      ?.textContent.trim() || `Serviço ${index + 1}`;
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Mostrar ${title}`);
    dot.addEventListener('click', () => goToLogicalSlide(index, true));
    pagination.appendChild(dot);
    return dot;
  });

  function easeInOutSine(value) {
    return -(Math.cos(Math.PI * value) - 1) / 2;
  }

  function slideTitle(index) {
    return originalSlides[index]
      .querySelector('.service-showcase__title')?.textContent.trim() ||
      `Serviço ${index + 1}`;
  }

  function logicalIndexFromPosition(value) {
    const renderedIndex = Math.round(value);
    if (renderedIndex <= 0) return COUNT - 1;
    if (renderedIndex >= COUNT + 1) return 0;
    return renderedIndex - 1;
  }

  function updateSelection(index, announce) {
    activeIndex = index;

    originalSlides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;
      if (active) {
        slide.setAttribute('aria-current', 'true');
      } else {
        slide.removeAttribute('aria-current');
      }
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });

    const title = slideTitle(index);
    countLabel.textContent =
      `${String(index + 1).padStart(2, '0')} / ${String(COUNT).padStart(2, '0')}`;
    currentTitle.textContent = title;

    if (announce) {
      status.textContent = `${title}. Serviço ${index + 1} de ${COUNT}.`;
    }
  }

  function updateSelectionFromPosition(announce) {
    const index = logicalIndexFromPosition(position);
    if (index !== activeIndex || announce) updateSelection(index, announce);
  }

  function paint() {
    if (!pitch) return;
    track.style.transform = `translate3d(${-position * pitch}px, 0, 0)`;
  }

  function clearAutoTimer() {
    if (autoTimer !== null) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function cancelMotion() {
    if (motionFrame !== null) {
      cancelAnimationFrame(motionFrame);
      motionFrame = null;
    }
    motion = null;
  }

  function normalizeLoopPosition() {
    if (position <= 0.0001) {
      position = COUNT;
      paint();
    } else if (position >= COUNT + 0.9999) {
      position = 1;
      paint();
    }
  }

  function animateTo(target, duration, options) {
    const settings = Object.assign({
      automatic: false,
      announce: false,
      onComplete: null
    }, options);

    cancelMotion();

    const from = position;
    const distance = target - from;

    if (reduceMotion.matches || duration <= 0 || Math.abs(distance) < 0.0001) {
      position = target;
      paint();
      normalizeLoopPosition();
      updateSelectionFromPosition(settings.announce);
      if (settings.onComplete) settings.onComplete();
      return;
    }

    motion = {
      automatic: settings.automatic,
      from,
      to: target,
      duration,
      startedAt: performance.now(),
      announce: settings.announce,
      onComplete: settings.onComplete
    };

    function frame(now) {
      if (!motion) return;

      const progress = Math.min(1, (now - motion.startedAt) / motion.duration);
      position = motion.from +
        (motion.to - motion.from) * easeInOutSine(progress);
      paint();
      updateSelectionFromPosition(false);

      if (progress < 1) {
        motionFrame = requestAnimationFrame(frame);
        return;
      }

      const completedMotion = motion;
      motionFrame = null;
      motion = null;
      position = completedMotion.to;
      paint();
      normalizeLoopPosition();
      updateSelectionFromPosition(completedMotion.announce);

      if (completedMotion.onComplete) completedMotion.onComplete();
    }

    motionFrame = requestAnimationFrame(frame);
  }

  function canAutoplay() {
    const pointerAllowsAutoplay = finePointer.matches || userOptedIntoAutoplay;
    return !reduceMotion.matches && pointerAllowsAutoplay && !userPaused &&
      sectionVisible && !document.hidden && !hovering &&
      (!focusWithin || playFocusOverride) && !drag;
  }

  function syncAutoplayControl() {
    const paused = userPaused || reduceMotion.matches ||
      (!finePointer.matches && !userOptedIntoAutoplay);
    root.classList.toggle('is-autoplay-paused', paused);
    autoplayButton.setAttribute('aria-pressed', paused ? 'true' : 'false');
    autoplayButton.setAttribute(
      'aria-label',
      paused
        ? 'Retomar apresentação automática'
        : 'Pausar apresentação automática'
    );
  }

  function pauseAutoGlide(options) {
    const settings = Object.assign({ finishCurrent: false }, options);
    clearAutoTimer();

    if (settings.finishCurrent && motion?.automatic) {
      pauseAfterTransition = true;
      return;
    }

    pauseAfterTransition = false;

    if (motion?.automatic) {
      pendingAutoTarget = motion.to;
      cancelMotion();
    }
  }

  function scheduleAutoGlide(delay) {
    clearAutoTimer();
    if (!canAutoplay()) return;

    autoTimer = setTimeout(() => {
      autoTimer = null;
      startAutoGlide();
    }, delay);
  }

  function startAutoGlide() {
    if (!canAutoplay() || motion) return;

    pauseAfterTransition = false;

    let target = pendingAutoTarget;
    if (target === null || target <= position + 0.0001) {
      target = Math.floor(position + 0.0001) + 1;
    }

    target = Math.min(COUNT + 1, target);
    pendingAutoTarget = target;

    const remainingDistance = Math.max(0.12, Math.abs(target - position));
    animateTo(target, AUTO_TRANSITION_DURATION * remainingDistance, {
      automatic: true,
      announce: false,
      onComplete: () => {
        const shouldPause = pauseAfterTransition;
        pauseAfterTransition = false;
        pendingAutoTarget = null;
        if (!shouldPause) scheduleAutoGlide(AUTOPLAY_DELAY);
      }
    });
  }

  function resumeAutoGlide() {
    if (!canAutoplay()) return;
    pauseAfterTransition = false;
    if (motion) return;
    scheduleAutoGlide(pendingAutoTarget === null ? AUTOPLAY_DELAY : 0);
  }

  function stopForManualInteraction() {
    pauseAutoGlide();
    pendingAutoTarget = null;
    cancelMotion();
  }

  function targetForLogicalIndex(index) {
    const normalTarget = index + 1;
    const candidates = [normalTarget];

    if (index === 0) candidates.push(COUNT + 1);
    if (index === COUNT - 1) candidates.push(0);

    return candidates.reduce((closest, candidate) =>
      Math.abs(candidate - position) < Math.abs(closest - position)
        ? candidate
        : closest
    );
  }

  function completeManualMovement(target, announce) {
    const distance = Math.abs(target - position);
    const duration = reduceMotion.matches
      ? 0
      : Math.min(900, Math.max(420, MANUAL_DURATION * distance));

    animateTo(target, duration, {
      automatic: false,
      announce,
      onComplete: () => resumeAutoGlide()
    });
  }

  function goToLogicalSlide(index, announce) {
    stopForManualInteraction();
    completeManualMovement(targetForLogicalIndex(index), announce);
  }

  function nudge(direction, announce) {
    stopForManualInteraction();
    const nearest = Math.round(position);
    const target = Math.max(0, Math.min(COUNT + 1, nearest + direction));
    completeManualMovement(target, announce);
  }

  function measure() {
    const firstSlide = renderedSlides[0];
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const trackStyles = getComputedStyle(track);
    const gap = parseFloat(trackStyles.columnGap) || 0;
    pitch = slideWidth + gap;
    paint();
  }

  previousButton.addEventListener('click', () => nudge(-1, true));
  nextButton.addEventListener('click', () => nudge(1, true));

  autoplayButton.addEventListener('click', () => {
    if (userPaused || (!finePointer.matches && !userOptedIntoAutoplay)) {
      userPaused = false;
      userOptedIntoAutoplay = true;
      playFocusOverride = true;
      syncAutoplayControl();
      resumeAutoGlide();
    } else {
      userPaused = true;
      playFocusOverride = false;
      syncAutoplayControl();
      pauseAutoGlide();
    }
  });

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nudge(-1, true);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nudge(1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToLogicalSlide(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      goToLogicalSlide(COUNT - 1, true);
    }
  });

  root.addEventListener('mouseenter', () => {
    hovering = true;
    pauseAutoGlide({ finishCurrent: true });
  });

  root.addEventListener('mouseleave', () => {
    hovering = false;
    if (!focusWithin || playFocusOverride) pauseAfterTransition = false;
    resumeAutoGlide();
  });

  root.addEventListener('focusin', (event) => {
    focusWithin = event.target.matches(':focus-visible');
    if (event.target !== autoplayButton) playFocusOverride = false;
    if (focusWithin && !playFocusOverride) {
      pauseAutoGlide({ finishCurrent: true });
    }
  });

  root.addEventListener('focusout', () => {
    setTimeout(() => {
      const focused = document.activeElement;
      focusWithin = root.contains(focused) && focused.matches(':focus-visible');
      if (!focusWithin) {
        playFocusOverride = false;
        if (!hovering) pauseAfterTransition = false;
        resumeAutoGlide();
      } else if (focused !== autoplayButton) {
        playFocusOverride = false;
        pauseAutoGlide({ finishCurrent: true });
      }
    }, 0);
  });

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    stopForManualInteraction();
    viewport.setPointerCapture(event.pointerId);
    root.classList.add('is-dragging');

    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startPosition: position,
      lastPosition: position,
      lastTime: performance.now(),
      velocity: 0
    };
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId || !pitch) return;

    const now = performance.now();
    const nextPosition = drag.startPosition -
      (event.clientX - drag.startX) / pitch;
    position = Math.max(-0.25, Math.min(COUNT + 1.25, nextPosition));
    drag.velocity = ((position - drag.lastPosition) /
      Math.max(now - drag.lastTime, 1)) * 1000;
    drag.lastPosition = position;
    drag.lastTime = now;

    paint();
    updateSelectionFromPosition(false);
  });

  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;

    const completedDrag = drag;
    const travelled = position - completedDrag.startPosition;
    const nearestStart = Math.round(completedDrag.startPosition);
    const intentionalSwipe = Math.abs(travelled) >= SWIPE_THRESHOLD ||
      Math.abs(completedDrag.velocity) >= FLICK_THRESHOLD;
    const direction = Math.sign(
      Math.abs(completedDrag.velocity) >= FLICK_THRESHOLD
        ? completedDrag.velocity
        : travelled
    );
    const target = intentionalSwipe
      ? nearestStart + direction
      : Math.round(position);

    drag = null;
    root.classList.remove('is-dragging');
    completeManualMovement(
      Math.max(0, Math.min(COUNT + 1, target)),
      true
    );
  }

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAutoGlide();
    } else {
      resumeAutoGlide();
    }
  });

  const intersectionObserver = new IntersectionObserver((entries) => {
    sectionVisible = entries[0]?.isIntersecting || false;
    if (sectionVisible) {
      resumeAutoGlide();
    } else {
      pauseAutoGlide();
    }
  }, { threshold: 0.2 });
  intersectionObserver.observe(root);

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(viewport);

  reduceMotion.addEventListener('change', () => {
    syncAutoplayControl();
    if (reduceMotion.matches) {
      pauseAutoGlide();
    } else {
      resumeAutoGlide();
    }
  });

  finePointer.addEventListener('change', () => {
    if (!finePointer.matches && !userOptedIntoAutoplay) userPaused = true;
    syncAutoplayControl();
    if (finePointer.matches) {
      resumeAutoGlide();
    } else {
      pauseAutoGlide();
    }
  });

  renderedSlides = Array.from(
    track.querySelectorAll('.service-showcase__slide')
  );
  root.classList.add('is-enhanced');
  updateSelection(0, false);
  syncAutoplayControl();
  measure();
  scheduleAutoGlide(AUTOPLAY_DELAY);
})();
