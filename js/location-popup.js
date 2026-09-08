(function () {
  const popup = document.getElementById('location-popup');
  if (!popup) return;

  const closeBtn = popup.querySelector('[data-location-popup-close]');
  const STORAGE_KEY = 'nb-location-popup-dismissed';
  const DELAY = 4000;

  // Se já foi fechado nesta sessão, não insiste — evita virar incômodo
  // para quem navega por várias páginas.
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
  } catch {
    // sessionStorage pode estar bloqueado (aba anônima, políticas do
    // navegador). Nesse caso o popup simplesmente aparece de novo.
  }

  let dispensado = false;   // fechado pela pessoa: não volta mais
  let jaApareceu = false;   // já passou o atraso inicial
  let noFim = false;        // rolagem chegou às unidades/rodapé

  const timer = window.setTimeout(() => {
    jaApareceu = true;
    atualizar();
  }, DELAY);

  function atualizar() {
    const deveMostrar = jaApareceu && !dispensado && !noFim;
    popup.classList.toggle('is-visible', deveMostrar);
  }

  function hide() {
    dispensado = true;
    window.clearTimeout(timer);
    atualizar();
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Sem persistência disponível: fechar continua valendo nesta página.
    }
  }

  closeBtn?.addEventListener('click', hide);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && popup.classList.contains('is-visible')) hide();
  });

  // Ao clicar no link do mapa a mensagem já cumpriu o papel.
  popup.querySelector('[data-location-popup-link]')?.addEventListener('click', hide);

  /* Recolhe ao chegar nas unidades: dali em diante a mensagem é redundante
     e o aviso só cobriria conteúdo (mapas, contatos, rodapé). Se a pessoa
     voltar ao topo, ele reaparece — a menos que tenha sido fechado. */
  const marco = document.getElementById('unidades') || document.querySelector('.site-footer');
  if (marco) {
    /* Leitura direta de posição em vez de IntersectionObserver: o IO não
       dispara ao sair por cima e depois voltar a ficar abaixo (isIntersecting
       é false nos dois estados, então não há transição), e o aviso deixava
       de reaparecer ao voltar ao topo. Ler o topo do marco cobre as duas
       direções. Throttle por rAF para não pesar na rolagem. */
    let agendado = false;

    function avaliar() {
      agendado = false;
      noFim = marco.getBoundingClientRect().top < window.innerHeight * 0.5;
      atualizar();
    }

    window.addEventListener('scroll', () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(avaliar);
    }, { passive: true });

    window.addEventListener('resize', avaliar, { passive: true });
    avaliar();
  }
})();
