import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://novabelluno.com.br',
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'always',
  integrations: [sitemap({
    filter: (page) => {
      const pathname = new URL(page).pathname;
      return !pathname.startsWith('/admin/')
        && pathname !== '/404/'
        && pathname !== '/servicos/';
    },
  })],
});
