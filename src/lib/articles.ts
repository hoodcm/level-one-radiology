import { getCollection } from 'astro:content';

/**
 * All publishable articles, newest first. Drafts (frontmatter `draft: true`)
 * appear only in the dev server, never in a production build.
 */
export async function getArticles() {
  const articles = await getCollection(
    'articles',
    ({ data }) => import.meta.env.DEV || !data.draft
  );
  return articles.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );
}
