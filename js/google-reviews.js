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

  /* O widget pede as fotos do Google no formato "=s120-c-rp-mo-br100",
     que o Google recusa (as fotos aparecem quebradas). Testado: apenas o
     sufixo de tamanho simples "=s120" responde. Normalizamos a URL de cada
     avatar; se ainda assim falhar, o avatar é escondido em vez de exibir
     o ícone de imagem quebrada. */
  function corrigirAvatares() {
    container.querySelectorAll('img[src*="googleusercontent.com"]').forEach((img) => {
      if (img.dataset.avatarCorrigido) return;
      img.dataset.avatarCorrigido = '1';

      const simples = img.src.replace(/=s(\d+)[-\w]*$/, '=s$1');
      if (simples !== img.src) img.src = simples;

      /* Se ainda assim falhar (o Google limita rajadas de requisições),
         troca por um círculo com a inicial em vez de esconder: o cartão
         nunca fica com buraco nem com ícone de imagem quebrada. */
      img.addEventListener('error', () => {
        if (img.dataset.temFallback) return;
        img.dataset.temFallback = '1';

        const nome = (img.alt || '').trim();
        const inicial = nome ? nome[0].toUpperCase() : '·';
        const marcador = document.createElement('span');
        marcador.className = 'jf-avatar-fallback';
        marcador.setAttribute('aria-hidden', 'true');
        marcador.textContent = inicial;

        const estilo = getComputedStyle(img);
        marcador.style.width = estilo.width;
        marcador.style.height = estilo.height;

        img.replaceWith(marcador);
      }, { once: true });
    });
  }

  /* Não desconecta ao carregar: o carrossel injeta mais avaliações depois,
     e os avatares novos também precisam da correção de URL. */
  let jaCarregou = false;
  const contentObserver = new MutationObserver(() => {
    corrigirAvatares();
    if (!jaCarregou) jaCarregou = markAsLoaded();
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
