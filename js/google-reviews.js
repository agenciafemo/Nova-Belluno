(function () {
  const shell = document.querySelector('[data-google-reviews-widget]');
  const container = document.getElementById(
    'JFWebsiteWidget-01a043613070700082758ad11d17666fbed9'
  );

  if (!shell || !container) return;

  const status = shell.querySelector('[data-google-reviews-status]');
  const scriptUrl =
    'https://www.jotform.com/website-widgets/embed/01a043613070700082758ad11d17666fbed9';

  let timeoutId;

  function showError() {
    shell.classList.add('has-error');
    if (status) {
      status.textContent =
        'Não foi possível carregar as avaliações agora. Você ainda pode consultá-las pelo link acima.';
    }
  }

  function markAsLoaded() {
    if (!container.childElementCount) return false;

    shell.classList.add('is-loaded');
    shell.classList.remove('has-error');
    window.clearTimeout(timeoutId);
    return true;
  }

  const contentObserver = new MutationObserver(() => {
    if (markAsLoaded()) contentObserver.disconnect();
  });

  contentObserver.observe(container, { childList: true, subtree: true });

  function loadWidget() {
    if (shell.dataset.widgetRequested === 'true') return;
    shell.dataset.widgetRequested = 'true';

    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      markAsLoaded();
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.dataset.googleReviewsLoader = 'true';
    script.addEventListener('error', showError, { once: true });
    document.head.appendChild(script);

    timeoutId = window.setTimeout(() => {
      if (!markAsLoaded()) showError();
    }, 12000);
  }

  if (!('IntersectionObserver' in window)) {
    loadWidget();
    return;
  }

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      visibilityObserver.disconnect();
      loadWidget();
    },
    { rootMargin: '360px 0px' }
  );

  visibilityObserver.observe(shell);
})();
