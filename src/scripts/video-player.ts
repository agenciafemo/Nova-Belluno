/* O Mux Player é um componente web pesado. Carregá-lo no início penalizaria o
   LCP de páginas onde o vídeo está bem abaixo da dobra, então o import só
   acontece quando o player se aproxima da viewport.

   Até lá o elemento <mux-player> permanece sem upgrade: o CSS reserva a
   proporção e mostra a miniatura, de modo que não há salto de layout. */
const players = document.querySelectorAll<HTMLElement>('mux-player');

if (players.length > 0) {
  let loading: Promise<unknown> | null = null;

  const loadPlayer = () => {
    loading ??= import('@mux/mux-player');
    return loading;
  };

  if (!('IntersectionObserver' in window)) {
    loadPlayer();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loadPlayer();
        observer.disconnect();
      },
      { rootMargin: '400px' },
    );

    players.forEach((player) => observer.observe(player));
  }

  /* O botão de velocidade do próprio player vive na barra inferior, junto de
     volume, tempo e tela cheia, e as partes do componente não podem ser
     movidas de lugar por CSS. Este controle é do site, fica sobreposto ao topo
     do vídeo e apenas ajusta a propriedade playbackRate. */
  const rates = [1, 1.5, 2];

  document.querySelectorAll<HTMLButtonElement>('[data-video-speed]').forEach((button) => {
    const frame = button.closest('.video-frame');
    const player = frame?.querySelector<HTMLMediaElement>('mux-player');
    if (!player) return;

    let index = 0;

    const label = () => {
      const rate = rates[index];
      const text = `${rate.toLocaleString('pt-BR')}x`;
      button.textContent = text;
      button.setAttribute('aria-label', `Velocidade de reprodução: ${text}. Alterar.`);
    };

    button.addEventListener('click', () => {
      index = (index + 1) % rates.length;
      player.playbackRate = rates[index];
      label();
    });

    /* O player redefine playbackRate ao carregar a mídia, então a escolha é
       reaplicada para não voltar sozinha a 1x. */
    player.addEventListener('loadedmetadata', () => {
      if (rates[index] !== 1) player.playbackRate = rates[index];
    });

    label();
    button.setAttribute('data-ready', '');
  });
}
