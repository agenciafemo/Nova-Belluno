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
const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
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

/* Duas rotas da Meta atendem este grid e a diferença aparece no prefixo do
   token. Um token de usuário do Instagram começa com IGAA, vale 60 dias e
   fala com graph.instagram.com. Um token de usuário do sistema começa com EAA,
   não expira e fala com graph.facebook.com. Detectar pelo prefixo permite
   trocar de uma rota para a outra alterando apenas o valor da variável de
   ambiente, sem mudar código nem coordenar um deploy. */
const usesInstagramLogin = token.startsWith('IGAA');
const apiHost = usesInstagramLogin ? 'graph.instagram.com' : 'graph.facebook.com';

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
  const url = new URL(`https://${apiHost}/${apiVersion}/${endpoint}`);
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
        (usesInstagramLogin
          ? 'Gere um novo com "npm run instagram:refresh" e atualize INSTAGRAM_ACCESS_TOKEN.'
          : 'Verifique se o usuário do sistema ainda tem acesso à Página no Meta Business.'),
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

/* Na rota do Instagram o token já aponta para a conta. Na rota do Facebook ele
   representa o usuário do sistema, que pode administrar várias Páginas, então
   é preciso chegar à conta profissional ligada à Página. */
async function resolveAccountNode() {
  if (usesInstagramLogin) return 'me';
  if (accountId) return accountId;

  const pages = await requestGraph('me/accounts', 'name,instagram_business_account{id,username}');
  const linked = (pages.data ?? []).find((page) => page.instagram_business_account?.id);

  if (!linked) {
    throw new Error(
      '[sync:instagram] Nenhuma Página do usuário do sistema tem conta profissional do ' +
      'Instagram vinculada. Confira os ativos atribuídos no Meta Business.',
    );
  }

  const found = linked.instagram_business_account;
  console.log(
    `[sync:instagram] Conta @${found.username} descoberta pela Página “${linked.name}”. ` +
    `Defina INSTAGRAM_BUSINESS_ACCOUNT_ID=${found.id} para evitar esta consulta a cada build.`,
  );
  return found.id;
}

const accountNode = await resolveAccountNode();
const profile = await requestGraph(accountNode, 'username,name,profile_picture_url');
const feed = await requestGraph(
  `${accountNode}/media`,
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
