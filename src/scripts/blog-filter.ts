/* Busca e filtro por categoria no índice do blog.
 *
 * O site é estático, então a filtragem acontece no navegador sobre os cartões
 * já renderizados: nenhuma requisição, nenhum recarregamento e o conteúdo
 * continua inteiro no HTML para os buscadores.
 *
 * Sem JavaScript a barra permanece oculta e a listagem completa continua
 * legível, que é o comportamento de hoje. */
const index = document.querySelector<HTMLElement>('[data-blog-index]');

if (index) {
  const toolbar = index.querySelector<HTMLElement>('[data-blog-toolbar]');
  const input = index.querySelector<HTMLInputElement>('[data-blog-search]');
  const chips = [...index.querySelectorAll<HTMLButtonElement>('[data-blog-category]')];
  const items = [...index.querySelectorAll<HTMLElement>('[data-blog-item]')];
  const status = index.querySelector<HTMLElement>('[data-blog-status]');
  const empty = index.querySelector<HTMLElement>('[data-blog-empty]');

  if (toolbar && input && items.length > 0) {
    toolbar.hidden = false;

    let category = 'todos';

    /* Acentos atrapalham a busca: quem digita "familia" espera encontrar
       "Família". A decomposição NFD separa o diacrítico da letra, e a faixa
       U+0300–U+036F remove só as marcas. */
    const normalize = (value: string) =>
      value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

    const apply = () => {
      const term = normalize(input.value);
      const filtering = term.length > 0 || category !== 'todos';
      let visible = 0;

      for (const item of items) {
        const sameCategory = category === 'todos' || item.dataset.category === category;
        const sameTerm = term.length === 0 || normalize(item.dataset.search ?? '').includes(term);

        /* Fora da filtragem, o artigo em destaque já aparece no cartão grande
           acima; mostrá-lo também na grade duplicaria a mesma leitura. */
        const show = sameCategory && sameTerm && (filtering || item.dataset.featured !== 'true');

        item.hidden = !show;
        if (show) visible += 1;
      }

      index.classList.toggle('is-filtering', filtering);
      if (empty) empty.hidden = visible > 0;

      if (status) {
        if (!filtering) {
          status.textContent = '';
        } else if (visible === 0) {
          status.textContent = 'Nenhum artigo encontrado.';
        } else {
          status.textContent = visible === 1
            ? '1 artigo encontrado.'
            : `${visible} artigos encontrados.`;
        }
      }
    };

    /* Um pequeno atraso evita recalcular e reanunciar a cada tecla digitada,
       o que deixaria o leitor de tela falando sobre resultados intermediários. */
    let debounce: number | undefined;
    input.addEventListener('input', () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(apply, 180);
    });

    input.addEventListener('search', apply);

    const selectCategory = (value: string) => {
      category = value;

      for (const chip of chips) {
        chip.setAttribute('aria-pressed', String(chip.dataset.blogCategory === value));
      }

      apply();
    };

    for (const chip of chips) {
      chip.addEventListener('click', () => selectCategory(chip.dataset.blogCategory ?? 'todos'));
    }

    /* O atalho dentro da mensagem de lista vazia limpa busca e categoria de
       uma vez. Ele não é um chip: não carrega estado e fica fora do grupo. */
    index.querySelector<HTMLButtonElement>('[data-blog-reset]')?.addEventListener('click', () => {
      input.value = '';
      selectCategory('todos');
      input.focus();
    });

    apply();
  }
}
