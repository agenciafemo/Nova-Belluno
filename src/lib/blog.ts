import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function getPostSlug(post: BlogPost): string {
  return post.id.replace(/\.(md|mdx)$/i, '');
}

export function getReadingTime(post: BlogPost): number {
  const words = (post.body ?? '')
    .replace(/[#>*_`\[\]()!-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

export function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return posts.sort(
    (first, second) => second.data.publishedAt.getTime() - first.data.publishedAt.getTime(),
  );
}

export function getRelatedPosts(
  currentPost: BlogPost,
  posts: BlogPost[],
  limit = 2,
): BlogPost[] {
  const currentTags = new Set(currentPost.data.tags);

  return posts
    .filter((post) => post.id !== currentPost.id)
    .map((post) => ({
      post,
      score:
        (post.data.category === currentPost.data.category ? 3 : 0)
        + post.data.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .sort((first, second) =>
      second.score - first.score
      || second.post.data.publishedAt.getTime() - first.post.data.publishedAt.getTime(),
    )
    .slice(0, limit)
    .map(({ post }) => post);
}
