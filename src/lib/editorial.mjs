/**
 * Shared checks used by the editor and the static publication pipeline.
 * They complement (not replace) database constraints and editorial review.
 * @param {{title: string, description: string, slug: string, body: string, author: string, coverImage: string, coverAlt: string, seoTitle?: string, seoDescription?: string, canonicalUrl?: string, publishing?: boolean}} input
 */
export function getEditorialFeedback(input) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  const title = (input.seoTitle || input.title).trim();
  const description = (input.seoDescription || input.description).trim();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) errors.push('A URL deve usar letras minúsculas, números e hífens.');
  if (input.title.trim().length < 10 || input.title.length > 120) errors.push('O título deve ter entre 10 e 120 caracteres.');
  if (input.description.trim().length < 30 || input.description.length > 180) errors.push('O resumo deve ter entre 30 e 180 caracteres.');
  if (input.body.trim().length < 100) errors.push('O conteúdo deve ter pelo menos 100 caracteres.');
  if (input.author.trim().length < 2 || input.author.length > 80) errors.push('Informe o autor real, com entre 2 e 80 caracteres.');
  if (input.coverAlt.trim().length < 10 || input.coverAlt.length > 180) errors.push('A descrição da imagem deve ter entre 10 e 180 caracteres.');
  if (input.seoTitle && input.seoTitle.length > 70) errors.push('O título SEO deve ter no máximo 70 caracteres.');
  if (input.seoDescription && input.seoDescription.length > 180) errors.push('A descrição SEO deve ter no máximo 180 caracteres.');
  if (!isValidCoverUrl(input.coverImage)) errors.push('Informe um caminho local ou uma URL HTTPS válida para a capa.');
  if (input.canonicalUrl && !isHttpsUrl(input.canonicalUrl)) errors.push('A URL canônica deve ser uma URL HTTPS válida, sem credenciais.');

  // Raw HTML is deliberately unsupported in editorial Markdown. This also
  // prevents executable HTML from entering generated pages through the CMS.
  if (/<\/?[a-z][a-z0-9-]*(?:\s[^>]*|\/?)>/i.test(input.body)
    || /(?:javascript|vbscript|data)\s*:/i.test(input.body)) {
    errors.push('Use apenas Markdown no conteúdo, sem HTML, scripts ou links executáveis.');
  }
  if (/^#\s+|^.+\n={3,}\s*$/m.test(input.body)) {
    const message = 'O título principal já é gerado pelo site. Use ## para os subtítulos, sem outro H1.';
    if (input.publishing) errors.push(message);
    else warnings.push(message);
  }
  if (title.length < 40 || title.length > 65) warnings.push('Revise a clareza do título SEO; 40 a 65 caracteres é uma referência, não uma regra de posicionamento.');
  if (description.length < 100 || description.length > 170) warnings.push('A descrição SEO pode resumir a resposta principal em aproximadamente 100 a 170 caracteres.');
  if ((input.body.match(/^##\s+.+$/gm) ?? []).length < 2) warnings.push('Organize o artigo com subtítulos que respondam às principais dúvidas do leitor.');
  if (!/\]\(https:\/\//i.test(input.body)) warnings.push('Quando houver informações de saúde ou números, inclua links para fontes confiáveis e confira a data.');
  return { errors, warnings, title, description };
}

/**
 * Estado dos campos que influenciam como o artigo aparece na busca.
 *
 * Nenhum item aqui impede a publicação: o site tem alternativa para todos
 * (o título SEO cai para o título, a descrição SEO cai para o resumo). A lista
 * existe para que deixar um campo vazio seja uma escolha e não um esquecimento,
 * que era o que acontecia quando esses campos não apareciam em lugar nenhum.
 *
 * @param {{title: string, description: string, body: string, coverAlt: string, seoTitle?: string, seoDescription?: string, tags?: string[]}} input
 */
export function getSeoChecklist(input) {
  const seoTitle = (input.seoTitle ?? '').trim();
  const seoDescription = (input.seoDescription ?? '').trim();
  const tags = (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
  const coverAlt = (input.coverAlt ?? '').trim();
  const headings = (input.body.match(/^##\s+.+$/gm) ?? []).length;
  const hasSources = /\]\(https:\/\//i.test(input.body);

  /** @type {{id: string, label: string, status: 'ok' | 'attention' | 'pending', detail: string}[]} */
  const items = [
    seoTitle.length === 0
      ? { id: 'seo-title', label: 'Título SEO', status: 'pending', detail: `Vazio. A busca vai exibir o título do artigo (${input.title.trim().length} caracteres).` }
      : seoTitle.length < 40 || seoTitle.length > 65
        ? { id: 'seo-title', label: 'Título SEO', status: 'attention', detail: `${seoTitle.length} caracteres. Entre 40 e 65 costuma aparecer inteiro na busca.` }
        : { id: 'seo-title', label: 'Título SEO', status: 'ok', detail: `${seoTitle.length} caracteres.` },

    seoDescription.length === 0
      ? { id: 'seo-description', label: 'Descrição SEO', status: 'pending', detail: `Vazia. A busca vai exibir o resumo do artigo (${input.description.trim().length} caracteres).` }
      : seoDescription.length < 100 || seoDescription.length > 170
        ? { id: 'seo-description', label: 'Descrição SEO', status: 'attention', detail: `${seoDescription.length} caracteres. Entre 100 e 170 costuma aparecer inteira.` }
        : { id: 'seo-description', label: 'Descrição SEO', status: 'ok', detail: `${seoDescription.length} caracteres.` },

    tags.length === 0
      ? { id: 'tags', label: 'Palavras-chave', status: 'pending', detail: 'Nenhuma informada. Elas organizam o blog e sugerem artigos relacionados.' }
      : { id: 'tags', label: 'Palavras-chave', status: 'ok', detail: `${tags.length} informada${tags.length > 1 ? 's' : ''}: ${tags.join(', ')}.` },

    coverAlt.length === 0
      ? { id: 'cover-alt', label: 'Descrição da imagem', status: 'pending', detail: 'Vazia. É o que leitores de tela anunciam e o que descreve a capa para os buscadores.' }
      : { id: 'cover-alt', label: 'Descrição da imagem', status: 'ok', detail: `${coverAlt.length} caracteres.` },

    headings < 2
      ? { id: 'headings', label: 'Subtítulos', status: 'pending', detail: `${headings} encontrado${headings === 1 ? '' : 's'}. Use ## para dividir o texto em respostas.` }
      : { id: 'headings', label: 'Subtítulos', status: 'ok', detail: `${headings} subtítulos no conteúdo.` },

    hasSources
      ? { id: 'sources', label: 'Fontes', status: 'ok', detail: 'O conteúdo cita ao menos um link externo.' }
      : { id: 'sources', label: 'Fontes', status: 'pending', detail: 'Sem links externos. Ao citar dados de saúde, aponte a fonte e confira a data.' },
  ];

  return { items, done: items.filter((item) => item.status === 'ok').length, total: items.length };
}

/** @param {string} value */
export function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** @param {string} value */
function isValidCoverUrl(value) {
  return /^\/(?!\/)[^\s\\]+$/.test(value) || isHttpsUrl(value);
}
