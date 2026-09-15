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
