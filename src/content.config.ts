import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    publishDate: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    primaryTag: z.string(),
    contentType: z.enum(['educational', 'commentary', 'case-analysis']),
    featured: z.boolean(),
    keyPoints: z.array(z.string()).optional(),
    caseImages: z.array(z.string()).optional(),
  }),
});

export const collections = { articles };
