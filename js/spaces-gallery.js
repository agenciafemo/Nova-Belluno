(function () {
  const galeria = document.querySelector('[data-spaces-gallery]');
  const dados = document.querySelector('[data-spaces-sets]');
  if (!galeria || !dados) return;

  let conjuntos;
  try {
    conjuntos = JSON.parse(dados.textContent || '[]');
  } catch {
    return; // JSON inválido: a galeria segue estática, sem quebrar a página.
  }
  if (!Array.isArray(conjuntos) || conjuntos.length < 2) return;

  const quadros = [...galeria.querySelectorAll('.about-page__space-image')];
  const anterior = galeria.querySelector('[data-spaces-prev]');
  const proximo = galeria.querySelector('[data-spaces-next]');
  const contador = galeria.querySelector('[data-spaces-counter]');
  if (quadros.length < 3 || !anterior || !proximo) return;

  const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)');
  let atual = 0;
  let trocando = false;

  function caminhos(nome) {
    const base = '/assets/img/local/' + nome;
    return {
      src: base + '-1280.webp',
      srcset: `${base}-640.webp 640w, ${base}-1280.webp 1280w, ${base}-1920.webp 1920w`,
    };
  }

  // Carrega o conjunto seguinte em segundo plano, para a troca não piscar.
  function preparar(indice) {
    const conjunto = conjuntos[indice];
    if (!conjunto) return;
    conjunto.forEach((foto) => {
      const img = new Image();
      const { src, srcset } = caminhos(foto.nome);
      img.srcset = srcset;
      img.src = src;
    });
  }

  function aplicar(indice) {
    const conjunto = conjuntos[indice];
    if (!conjunto) return;

    quadros.forEach((quadro, i) => {
      const foto = conjunto[i];
      if (!foto) return;
      const img = quadro.querySelector('img');
      const legenda = quadro.querySelector('figcaption');
      const { src, srcset } = caminhos(foto.nome);
      if (img) {
        img.srcset = srcset;
        img.src = src;
        img.alt = foto.alt;
      }
      if (legenda) legenda.textContent = foto.legenda;
    });

    if (contador) contador.textContent = `${indice + 1} de ${conjuntos.length}`;
    preparar((indice + 1) % conjuntos.length);
  }

  function ir(passo) {
    if (trocando) return;
    atual = (atual + passo + conjuntos.length) % conjuntos.length;

    if (semAnimacao.matches) {
      aplicar(atual);
      return;
    }

    trocando = true;
    galeria.classList.add('is-trocando');
    // Espera o fade-out terminar antes de trocar as fontes, senão a imagem
    // nova aparece antes do quadro escurecer.
    window.setTimeout(() => {
      aplicar(atual);
      galeria.classList.remove('is-trocando');
      trocando = false;
    }, 220);
  }

  anterior.addEventListener('click', () => ir(-1));
  proximo.addEventListener('click', () => ir(1));

  galeria.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') { evento.preventDefault(); ir(-1); }
    if (evento.key === 'ArrowRight') { evento.preventDefault(); ir(1); }
  });

  if (contador) contador.textContent = `1 de ${conjuntos.length}`;
  preparar(1);
})();
