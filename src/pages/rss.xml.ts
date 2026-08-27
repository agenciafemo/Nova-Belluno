import type { APIRoute } from 'astro';
import { getPostSlug, getPublishedPosts } from '../lib/blog';

export const prerender = true;

const xml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://novabelluno.com.br');
  const posts = await getPublishedPosts();
  const items = posts.map((post) => {
    const url = new URL(`/blog/${getPostSlug(post)}/`, base).href;
    return `
      <item>
        <title>${xml(post.data.title)}</title>
        <link>${xml(url)}</link>
        <guid isPermaLink="true">${xml(url)}</guid>
        <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>
        <description>${xml(post.data.description)}</description>
        <category>${xml(post.data.category)}</category>
      </item>`;
  }).join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog Nova Belluno</title>
    <link>${xml(new URL('/blog/', base).href)}</link>
    <description>Conteúdos sobre cuidado, convivência, família e bem-estar na terceira idade.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
