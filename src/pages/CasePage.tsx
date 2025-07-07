import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePost, useAllPosts } from '@/hooks/useAsyncPosts';
import NotFound from './NotFound';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { authors } from '@/data/authors';
import { Seo } from '@/components/Seo';
import { CaseViewerShell } from '@/components/CaseViewerShell';
import type { ProcessedPost } from '@/lib/content';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';

interface CaseManifest {
  baseUrl: string;
  slices: number;
}

export default function CasePage() {
  const { slug } = useParams();
  const { post, loading: postLoading, error: postError } = usePost(slug || '');
  const { posts: allPosts, loading: postsLoading } = useAllPosts();
  const [manifest, setManifest] = useState<CaseManifest | null>(null);
  const [manifestLoading, setManifestLoading] = useState(true);

  // Fetch manifest at build time
  useEffect(() => {
    if (!slug) return;

    const fetchManifest = async () => {
      try {
        const response = await fetch(`/cases/${slug}/manifest.json`);
        if (response.ok) {
          const manifestData = await response.json();
          setManifest(manifestData);
        }
      } catch (error) {
        console.error('Failed to load case manifest:', error);
      } finally {
        setManifestLoading(false);
      }
    };

    fetchManifest();
  }, [slug]);

  if (postLoading || manifestLoading) {
    return (
      <div className="container mx-auto py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post || postError) {
    return <NotFound />;
  }

  const author = authors.find((a) => a.id === post.authorId);
  const relatedPosts = !postsLoading ? allPosts.filter(p => p.slug !== post.slug && p.category === 'Case Study').slice(0, 2) : [];

  const postUrl = `${window.location.origin}/cases/${post.slug}`;
  const imageUrl = `https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60`;
  const publishedDate = format(new Date(post.date), 'yyyy-MM-dd');

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalEntity',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.title,
    description: post.description,
    image: imageUrl,
    author: {
      '@type': 'Person',
      name: author?.name || 'Level One Radiology',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Level One Radiology',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lovable.dev/opengraph-image-p98pqg.png',
      },
    },
    datePublished: publishedDate,
    dateModified: publishedDate,
  };

  return (
    <>
      <Seo title={post.title} description={post.description} jsonLd={jsonLdData} />
      <div className="container mx-auto py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-12 xl:gap-16">
          <main className="lg:col-span-3" role="main">
            <Breadcrumbs postTitle={post.title} postCategory="Case Study" />
            
            <header className="mb-8 md:mb-12 lg:mb-16">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-text-primary mb-4 md:mb-6">
                {post.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                {author ? (
                  <p className="text-text-secondary text-sm sm:text-base">
                    By{' '}
                    <Link 
                      to={`/authors/${author.slug}`} 
                      className="hover:text-text-primary transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
                    >
                      {author.name}
                    </Link>{' '}
                    on <time dateTime={post.date}>{post.date}</time>
                  </p>
                ) : (
                  <p className="text-text-secondary text-sm sm:text-base">
                    On <time dateTime={post.date}>{post.date}</time>
                  </p>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  {post.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full"
                      role="tag"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </header>
            
            <article
              className="prose prose-slate dark:prose-invert prose-base sm:prose-lg lg:prose-xl max-w-none text-text-secondary prose-headings:font-serif prose-headings:text-text-primary prose-a:text-accent hover:prose-a:text-text-primary prose-a:focus-visible:ring-2 prose-a:focus-visible:ring-accent prose-a:focus-visible:ring-offset-2 mb-8 md:mb-12 lg:mb-16"
              role="article"
              aria-labelledby="article-title"
            >
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>

            {/* Case Viewer Section */}
            {manifest && (
              <section className="mb-8 md:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary mb-6">
                  Interactive Case Viewer
                </h2>
                <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                  <CaseViewerShell 
                    manifest={manifest}
                    studyId={post.slug}
                  />
                </div>
              </section>
            )}

            {!manifest && !manifestLoading && (
              <section className="mb-8 md:mb-12 lg:mb-16">
                <div className="bg-surface-card border border-border rounded-lg p-6 text-center">
                  <p className="text-text-secondary">
                    Interactive viewer not available for this case.
                  </p>
                </div>
              </section>
            )}
          </main>
          
          <aside 
            className="lg:col-span-1 lg:border-l lg:border-border lg:pl-8 xl:pl-12"
            role="complementary"
            aria-label="Case sidebar"
          >
            <section aria-labelledby="tags-heading">
              <h3 id="tags-heading" className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-4 md:mb-6">
                Case Tags
              </h3>
              <div className="flex flex-wrap gap-2 mb-8 md:mb-12 lg:mb-16" role="list">
                {post.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full"
                    role="listitem"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
            
            <section aria-labelledby="related-heading">
              <h3 id="related-heading" className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-4 md:mb-6">
                Related Cases
              </h3>
              <nav className="space-y-4 md:space-y-6" aria-label="Related cases">
                {relatedPosts.map(related => (
                  <Link 
                    to={`/cases/${related.slug}`} 
                    key={related.id} 
                    className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded p-2 -m-2"
                  >
                    <h4 className="font-serif font-bold text-text-primary group-hover:text-accent transition-colors text-base sm:text-lg">
                      {related.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      <time dateTime={related.date}>{related.date}</time>
                    </p>
                  </Link>
                ))}
                
                {relatedPosts.length === 0 && !postsLoading && (
                  <p className="text-sm text-text-secondary">No related cases found.</p>
                )}
              </nav>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}