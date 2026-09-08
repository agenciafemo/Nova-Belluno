import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const errors = [];
const warnings = [];
const titles = new Map();
const canonicals = new Map();

const walk = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
};

const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match?.[1] ?? match?.[2];
};

const reportDuplicate = (map, label) => {
  for (const [value, pages] of map) {
    if (pages.length > 1) errors.push(`${label} duplicado em ${pages.join(', ')}: ${value}`);
  }
};

try {
  await access(dist);
} catch {
  console.error('[audit:build] A pasta dist não existe. Execute o build primeiro.');
  process.exit(1);
}

const files = await walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const page = path.relative(dist, file).replaceAll('\\', '/');
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i)?.[1] ?? '';
  const isNoIndex = /noindex/i.test(robots);
  const isRedirect = /<meta\s+http-equiv=["']refresh["']/i.test(html);
  const isIndexable = !isNoIndex && !isRedirect && page !== '404.html' && page !== '404/index.html';

  if (!/<html\b[^>]*\blang=["']pt-BR["']/i.test(html)) errors.push(`${page}: lang="pt-BR" ausente.`);

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1].trim();
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1].trim();

  if (!title) errors.push(`${page}: <title> ausente ou vazio.`);
  if (!description) errors.push(`${page}: meta description ausente.`);
  if (!canonical || !/^https:\/\//.test(canonical)) errors.push(`${page}: canonical HTTPS absoluto ausente.`);

  if (isIndexable) {
    if (!/\bindex\b/i.test(robots) || /\bnoindex\b/i.test(robots)) errors.push(`${page}: diretiva index ausente.`);
    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    if (h1Count !== 1) errors.push(`${page}: esperado 1 H1, encontrado ${h1Count}.`);
    if (title) titles.set(title, [...(titles.get(title) ?? []), page]);
    if (canonical) canonicals.set(canonical, [...(canonicals.get(canonical) ?? []), page]);
  }

  if (description && (description.length < 50 || description.length > 180)) {
    warnings.push(`${page}: meta description com ${description.length} caracteres.`);
  }

  for (const script of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      errors.push(`${page}: JSON-LD inválido (${error instanceof Error ? error.message : 'erro desconhecido'}).`);
    }
  }

  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (attribute(image, 'alt') === undefined) errors.push(`${page}: imagem sem atributo alt.`);
    if (!attribute(image, 'width') || !attribute(image, 'height')) errors.push(`${page}: imagem sem width/height explícitos.`);
  }

  for (const tag of html.match(/<(?:img|script|source)\b[^>]*>/gi) ?? []) {
    const source = attribute(tag, 'src');
    if (!source || !source.startsWith('/') || source.startsWith('//')) continue;
    const pathname = decodeURIComponent(source.split(/[?#]/)[0]);
    try {
      await access(path.join(dist, pathname.replace(/^\/+/, '')));
    } catch {
      errors.push(`${page}: recurso interno inexistente ${pathname}.`);
    }
  }
}

reportDuplicate(titles, 'Título');
reportDuplicate(canonicals, 'Canonical');

for (const sitemapFile of files.filter((file) => /sitemap.*\.xml$/i.test(file))) {
  const sitemap = await readFile(sitemapFile, 'utf8');
  for (const forbidden of ['/admin/', '/404/', '/servicos/']) {
    if (sitemap.includes(`https://novabelluno.com.br${forbidden}`)) {
      errors.push(`${path.basename(sitemapFile)}: URL não indexável incluída (${forbidden}).`);
    }
  }
}

for (const warning of warnings) console.warn(`[aviso] ${warning}`);
if (errors.length > 0) {
  for (const error of errors) console.error(`[erro] ${error}`);
  console.error(`[audit:build] Falhou com ${errors.length} erro(s) e ${warnings.length} aviso(s).`);
  process.exit(1);
}

console.log(`[audit:build] ${htmlFiles.length} página(s) verificadas; nenhum erro e ${warnings.length} aviso(s).`);
