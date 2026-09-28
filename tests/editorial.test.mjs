import test from 'node:test';
import assert from 'node:assert/strict';
import { getEditorialFeedback, getSeoChecklist, isHttpsUrl } from '../src/lib/editorial.mjs';

const article = {
  title: 'Como conhecer um residencial geriátrico com calma',
  description: 'Conheça os pontos que ajudam a família a avaliar um residencial geriátrico, desde os ambientes até o diálogo com a equipe.',
  slug: 'como-conhecer-um-residencial',
  body: 'Uma decisão cuidadosa começa pelo diálogo e pelo respeito às necessidades da pessoa idosa.\n\n## Conheça os ambientes\nConverse com a equipe.\n\n## Tire suas dúvidas\nConfirme a disponibilidade.',
  author: 'Equipe Nova Belluno',
  coverImage: '/assets/img/local/recepcao-01-1280.webp',
  coverAlt: 'Recepção da unidade principal da Nova Belluno em Siderópolis',
  publishing: true,
};

test('aceita um artigo válido e não exige palavras-chave artificiais', () => {
  assert.deepEqual(getEditorialFeedback(article).errors, []);
});
test('rejeita HTML executável e links javascript', () => {
  for (const body of [`${article.body}<script>alert(1)</script>`, `${article.body}[link](javascript:alert(1))`]) {
    assert.ok(getEditorialFeedback({ ...article, body }).errors.some((error) => error.includes('Markdown')));
  }
});
test('impede um segundo H1 em artigos publicados', () => {
  assert.ok(getEditorialFeedback({ ...article, body: `# Outro título\n${article.body}` }).errors.some((error) => error.includes('H1')));
});
test('permite H1 em rascunho com aviso para corrigir', () => {
  const result = getEditorialFeedback({ ...article, publishing: false, body: `# Outro título\n${article.body}` });
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some((warning) => warning.includes('H1')));
});
test('rejeita slugs que poderiam escapar do diretório de conteúdo', () => {
  assert.ok(getEditorialFeedback({ ...article, slug: '../admin' }).errors.length > 0);
});
test('valida URL HTTPS e rejeita credenciais e URLs relativas a outro host', () => {
  assert.equal(isHttpsUrl('https://novabelluno.com.br/blog/artigo/'), true);
  assert.equal(isHttpsUrl('https://user:password@example.com/'), false);
  assert.ok(getEditorialFeedback({ ...article, coverImage: '//example.com/image.webp' }).errors.length > 0);
});
test('a prévia usa os campos SEO, com fallback para o título e resumo', () => {
  assert.equal(getEditorialFeedback(article).title, article.title);
  assert.equal(getEditorialFeedback({ ...article, seoTitle: 'Título SEO específico para o artigo' }).title, 'Título SEO específico para o artigo');
});

const estado = (entrada) => Object.fromEntries(
  getSeoChecklist({ ...article, ...entrada }).items.map((item) => [item.id, item.status]),
);

test('a nota de SEO aponta os campos que ficaram vazios', () => {
  const resultado = getSeoChecklist(article);
  const estados = Object.fromEntries(resultado.items.map((item) => [item.id, item.status]));

  assert.equal(estados['seo-title'], 'pending');
  assert.equal(estados['seo-description'], 'pending');
  assert.equal(estados.tags, 'pending');
  assert.equal(estados.sources, 'pending');
  assert.equal(resultado.done, 2);
  assert.equal(resultado.total, 6);
});

test('campos preenchidos dentro da faixa recomendada ficam concluídos', () => {
  const estados = estado({
    seoTitle: 'Como escolher um residencial geriátrico com calma e segurança',
    seoDescription: 'Um roteiro prático para a família avaliar ambientes, equipe, rotina e comunicação antes de escolher um residencial geriátrico para a pessoa idosa.',
    tags: ['residencial geriátrico', 'família'],
  });

  assert.equal(estados['seo-title'], 'ok');
  assert.equal(estados['seo-description'], 'ok');
  assert.equal(estados.tags, 'ok');
});

test('comprimento fora da faixa vira atenção, não pendência', () => {
  const estados = estado({ seoTitle: 'Título curto', seoDescription: 'Descrição curta demais para a busca.' });

  assert.equal(estados['seo-title'], 'attention');
  assert.equal(estados['seo-description'], 'attention');
});

test('nenhum item da nota de SEO impede a publicação', () => {
  assert.deepEqual(getEditorialFeedback({ ...article, tags: [], seoTitle: '', seoDescription: '' }).errors, []);
});

test('palavras-chave em branco não contam como preenchidas', () => {
  assert.equal(estado({ tags: ['  ', ''] }).tags, 'pending');
});
