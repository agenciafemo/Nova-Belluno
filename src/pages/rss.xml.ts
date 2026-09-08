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

  const lastBuildDate = posts[0]
    ? (posts[0].data.updatedAt ?? posts[0].data.publishedAt).toUTCString()
    : new Date().toUTCString();
  const feedUrl = new URL('/rss.xml', base).href;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Nova Belluno</title>
    <link>${xml(new URL('/blog/', base).href)}</link>
    <atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>Conteúdos sobre cuidado, convivência, família e bem-estar na terceira idade.</description>
    <language>pt-BR</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
