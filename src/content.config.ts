import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { PRIMARY_TAG_NAMES, CONTENT_TYPE_NAMES } from './lib/tags';
import { caseAwareGlob } from './lib/case-loader';

const articles = defineCollection({
  // glob(), wrapped: articles embedding ::case re-render when their case's
  // manifest rev moves (regeneration/deletion), live in dev (case-loader.ts).
  loader: caseAwareGlob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    /** House accession format — assigned once at authoring, never reused. */
    serial: z.string().regex(/^L1-\d{4}$/),
    publishDate: z.coerce.date(),
    /** Clinical currency: bump when the content is re-reviewed. */
    lastReviewed: z.coerce.date().optional(),
    description: z.string(),
    tags: z.array(z.string()),
    primaryTag: z.enum(PRIMARY_TAG_NAMES),
    contentType: z.enum(CONTENT_TYPE_NAMES),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    keyPoints: z.array(z.string()).optional(),
    caseImages: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  }),
});

export const collections = { articles };
