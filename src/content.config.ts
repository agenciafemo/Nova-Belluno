import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string().min(10),
    description: z.string().min(30).max(180),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default('Equipe Nova Belluno'),
    category: z.enum(['Cuidados', 'Bem-estar', 'Família', 'Envelhecimento']),
    tags: z.array(z.string()).default([]),
    coverImage: z.union([
      z.string().startsWith('/'),
      z.string().regex(/^https:\/\//, 'Use uma URL HTTPS válida para a imagem de capa.'),
    ]),
    coverAlt: z.string().min(10),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(180).optional(),
  }),
});

export const collections = { blog };
