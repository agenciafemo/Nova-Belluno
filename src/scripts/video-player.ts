/* O Mux Player é um componente web pesado. Carregá-lo no início penalizaria o
   LCP de páginas onde o vídeo está bem abaixo da dobra, então o import só
   acontece quando o player se aproxima da viewport.

   Até lá o elemento <mux-player> permanece sem upgrade: o CSS reserva a
   proporção e mostra a miniatura, de modo que não há salto de layout. */
const players = document.querySelectorAll('mux-player');

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
}
