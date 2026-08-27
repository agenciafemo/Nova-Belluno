(function () {
  const list = document.querySelector('.trust-stats__list');
  if (!list) return;

  const counters = Array.from(list.querySelectorAll('[data-count]'));
  if (!counters.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

  const DURATION = 1400;
  const STAGGER = 110;
  let hasAnimated = false;

  function formatValue(counter, value) {
    const prefix = counter.dataset.prefix || '';
    const suffix = counter.dataset.suffix || '';
    const formatted = value.toLocaleString('pt-BR');
    return `${prefix}${formatted}${suffix}`;
  }

  counters.forEach((counter) => {
    const start = Number(counter.dataset.start || 0);
    counter.textContent = formatValue(counter, start);
  });

  function animateCounters() {
    if (hasAnimated) return;
    hasAnimated = true;

    const startedAt = performance.now();

    function update(now) {
      let isComplete = true;

      counters.forEach((counter, index) => {
        const target = Number(counter.dataset.count);
        const start = Number(counter.dataset.start || 0);
        const elapsed = now - startedAt - index * STAGGER;
        const progress = Math.min(Math.max(elapsed / DURATION, 0), 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        counter.textContent = formatValue(
          counter,
          Math.round(start + (target - start) * easedProgress)
        );
        if (progress < 1) isComplete = false;
      });

      if (!isComplete) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;

    observer.disconnect();
    animateCounters();
  }, {
    threshold: 0.35
  });

  observer.observe(list);
})();
