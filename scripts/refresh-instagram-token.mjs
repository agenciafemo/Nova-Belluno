/* Renova o token de longa duração do Instagram.
 *
 * O token vale 60 dias e só pode ser renovado depois de 24 horas de vida.
 * Este script não grava nada: ele imprime o novo valor para ser colado no
 * .env local e nas variáveis de ambiente do provedor de hospedagem. Gravar
 * automaticamente exigiria um armazenamento compartilhado entre builds, o
 * que está descrito como próximo passo em docs/INSTAGRAM_SETUP.md. */

try {
  process.loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const token = process.env.INSTAGRAM_ACCESS_TOKEN;

if (!token) {
  console.error('[instagram:refresh] Defina INSTAGRAM_ACCESS_TOKEN no .env antes de renovar.');
  process.exit(1);
}

/* Um token de usuário do sistema não expira e não tem endpoint de renovação.
   Chamar refresh_access_token com ele devolveria um erro confuso. */
if (!token.startsWith('IGAA')) {
  console.log(
    '[instagram:refresh] O token configurado é de usuário do sistema e não expira. ' +
    'Nada a renovar.',
  );
  process.exit(0);
}

const url = new URL('https://graph.instagram.com/refresh_access_token');
url.searchParams.set('grant_type', 'ig_refresh_token');
url.searchParams.set('access_token', token);

const response = await fetch(url);
const payload = await response.json();

if (!response.ok) {
  const detail = payload?.error?.message ?? `HTTP ${response.status}`;
  console.error(
    `[instagram:refresh] A Meta recusou a renovação: ${detail}\n` +
    'Se o token já expirou, gere um novo no painel do app: ' +
    'Casos de uso > Instagram > Configurações > Gerar token.',
  );
  process.exit(1);
}

const days = Math.floor((payload.expires_in ?? 0) / 86400);
const expiresAt = new Date(Date.now() + (payload.expires_in ?? 0) * 1000);

console.log(
  `[instagram:refresh] Token renovado por ${days} dia(s), até ${expiresAt.toLocaleDateString('pt-BR')}.\n\n` +
  'Atualize INSTAGRAM_ACCESS_TOKEN no .env e no provedor de hospedagem:\n\n' +
  `${payload.access_token}\n`,
);
