import rss from '@astrojs/rss';
import { getArticles } from '@/lib/articles';

export async function GET(context) {
  const articles = await getArticles();
  return rss({
    title: 'Level One Radiology',
    description:
      'An independent emergency radiology publication. Clinical deep-dives, teaching cases, and field notes from a practicing radiologist.',
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishDate,
      link: `/articles/${article.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
