import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://novabelluno.com.br',
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'always',
  integrations: [sitemap({
    filter: (page) => !page.includes('/admin/') && !page.endsWith('/servicos/'),
  })],
});
