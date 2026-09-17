import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Astro lê o .env mais tarde, mas este script roda antes do Astro iniciar.
try {
  process.loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const token = process.env.INSTAGRAM_ACCESS_TOKEN;
const apiVersion = process.env.INSTAGRAM_API_VERSION || 'v26.0';
const postCount = 6;
const imageDirectory = path.resolve('src/assets/instagram');
const dataFile = path.resolve('src/data/instagram.json');

/* O grid tem um conjunto editorial versionado no repositório. Sem token o
   build segue com ele, do mesmo modo que o blog mantém os artigos locais
   quando o Supabase não está configurado. */
if (!token) {
  console.log('[sync:instagram] Token ausente; mantendo o grid editorial versionado.');
  process.exit(0);
}

/* A miniatura de um Reel só existe em thumbnail_url; media_url devolve o MP4.
   Álbuns expõem a primeira imagem em media_url, que é o que o grid mostra. */
const supportedTypes = new Set(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']);
const maxImageBytes = 8 * 1024 * 1024;
const allowedContentTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

async function requestGraph(endpoint, fields) {
  const url = new URL(`https://graph.instagram.com/${apiVersion}/${endpoint}`);
  url.searchParams.set('fields', fields);
  url.searchParams.set('access_token', token);

  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    const detail = payload?.error?.message ?? `HTTP ${response.status}`;
    /* 190 é token inválido ou expirado. Falhar aqui é melhor que publicar um
       grid silenciosamente congelado: o token de longa duração vale 60 dias. */
    if (payload?.error?.code === 190) {
      throw new Error(
        `[sync:instagram] Token recusado pela Meta (${detail}). ` +
        'Gere um novo com "npm run instagram:refresh" e atualize INSTAGRAM_ACCESS_TOKEN.',
      );
    }
    throw new Error(`[sync:instagram] Falha ao consultar a Graph API: ${detail}`);
  }

  return payload;
}

/* A API não fornece texto alternativo. A legenda é a melhor aproximação
   disponível: usamos a primeira frase, sem hashtags nem menções, para não
   deixar a imagem sem descrição para quem usa leitor de tela. */
function buildAlt(caption) {
  const firstBlock = String(caption ?? '').split('\n').find((line) => line.trim().length > 0) ?? '';
  const cleaned = firstBlock
    .replace(/[#@][\p{L}\p{N}_.]+/gu, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length < 10) return 'Publicação da Nova Belluno no Instagram';
  if (cleaned.length <= 180) return cleaned;
  return `${cleaned.slice(0, 177).trimEnd()}…`;
}

async function downloadImage(sourceUrl, label) {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`[sync:instagram] Falha ao baixar a imagem de ${label}: HTTP ${response.status}.`);
  }

  const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  const extension = allowedContentTypes.get(contentType);
  if (!extension) {
    throw new Error(`[sync:instagram] Formato inesperado em ${label}: “${contentType || 'desconhecido'}”.`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > maxImageBytes) {
    throw new Error(`[sync:instagram] Imagem de ${label} excede ${maxImageBytes / 1024 / 1024} MB.`);
  }

  return { bytes, extension };
}

/* A capa que o Instagram escolhe para um Reel costuma ser o primeiro quadro do
   vídeo, que muitas vezes é o preto de um fade-in. Publicar isso deixaria um
   quadrado vazio no grid, então a publicação é descartada e a seguinte entra
   no lugar. O desvio padrão distingue uma imagem chapada de uma foto escura
   porém legítima, como uma cena noturna. */
async function isBlankImage(bytes) {
  try {
    const { channels } = await sharp(bytes).stats();
    return channels.every((channel) => channel.stdev < 3);
  } catch {
    return false;
  }
}

const profile = await requestGraph('me', 'username,name,profile_picture_url');
const feed = await requestGraph(
  'me/media',
  'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
);

const candidates = (feed.data ?? [])
  .filter((item) => supportedTypes.has(item.media_type))
  .filter((item) => item.permalink && (item.thumbnail_url || item.media_url));

if (candidates.length === 0) {
  throw new Error('[sync:instagram] A Graph API não devolveu publicações utilizáveis.');
}

/* Baixa tudo em memória antes de tocar no disco. Um download que falhar no
   meio não pode deixar o grid com metade das imagens novas e metade antigas. */
const downloaded = [];
let skippedCount = 0;

for (const item of candidates) {
  if (downloaded.length === postCount) break;

  const position = String(downloaded.length + 1).padStart(2, '0');
  const sourceUrl = item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url;
  const { bytes, extension } = await downloadImage(sourceUrl, `post-${position}`);

  if (await isBlankImage(bytes)) {
    console.warn(`[sync:instagram] Capa sem conteúdo visível em ${item.permalink}; publicação ignorada.`);
    skippedCount += 1;
    continue;
  }

  downloaded.push({
    fileName: `post-${position}${extension}`,
    bytes,
    entry: {
      id: item.id,
      permalink: item.permalink,
      mediaType: item.media_type,
      image: `post-${position}${extension}`,
      alt: buildAlt(item.caption),
      timestamp: item.timestamp ?? null,
    },
  });
}

if (downloaded.length < postCount) {
  console.warn(
    `[sync:instagram] Apenas ${downloaded.length} de ${postCount} publicações utilizáveis no feed.`,
  );
}

let avatarFileName = 'avatar.webp';
if (profile.profile_picture_url) {
  const avatar = await downloadImage(profile.profile_picture_url, 'avatar');
  avatarFileName = `avatar${avatar.extension}`;
  downloaded.push({ fileName: avatarFileName, bytes: avatar.bytes, entry: null });
}

await mkdir(imageDirectory, { recursive: true });

const writtenFiles = new Set();
for (const file of downloaded) {
  await writeFile(path.join(imageDirectory, file.fileName), file.bytes);
  writtenFiles.add(file.fileName);
}

/* Remove sobras de sincronizações anteriores — por exemplo um post-02.jpg
   quando a publicação nova chegou como post-02.webp. Sem isso o diretório
   acumula imagens que ninguém referencia e que entram no bundle. */
let removedCount = 0;
for (const entry of await readdir(imageDirectory, { withFileTypes: true })) {
  if (!entry.isFile() || writtenFiles.has(entry.name)) continue;
  if (!/^(post-\d{2}|avatar)\.(jpg|png|webp)$/i.test(entry.name)) continue;

  await unlink(path.join(imageDirectory, entry.name));
  removedCount += 1;
}

const data = {
  syncedAt: new Date().toISOString(),
  source: 'instagram-graph-api',
  profile: {
    username: profile.username ?? 'novabelluno',
    name: profile.name ?? 'Nova Belluno Longevidade',
    avatar: avatarFileName,
  },
  posts: downloaded.filter((file) => file.entry).map((file) => file.entry),
};

await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

console.log(
  `[sync:instagram] ${data.posts.length} publicação(ões) sincronizada(s) de @${data.profile.username}; ` +
  `${skippedCount} ignorada(s) por capa vazia; ${removedCount} arquivo(s) obsoleto(s) removido(s).`,
);
