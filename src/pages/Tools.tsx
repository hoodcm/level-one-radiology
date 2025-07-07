
import React from 'react';
import { usePostsByCategory } from '@/hooks/useAsyncPosts';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/PostCardSkeleton';
import { Seo } from '@/components/Seo';
import { useSmartSkeleton } from '@/hooks/useSmartSkeleton';

const Tools = () => {
  const { posts: toolPosts, loading, error } = usePostsByCategory('Tool');
  const showSkeleton = useSmartSkeleton(loading, {
    delay: 200,
    minDisplayTime: 300
  });

  const pageTitle = "Tools";
  const pageDescription = "Useful tools, resources, and technical guides for radiologists.";

  return (
    <>
      <Seo title={pageTitle} description={pageDescription} />
      <div className="container mx-auto py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6 lg:mb-8 text-text-primary">{pageTitle}</h1>
        <p className="text-text-secondary mb-8 md:mb-12 lg:mb-16 text-base sm:text-lg">{pageDescription}</p>
        
        
        <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8">
          {showSkeleton ? (
            Array.from({ length: 4 }).map((_, index) => <PostCardSkeleton key={index} />)
          ) : error ? (
            <p className="col-span-12 text-red-500 text-base sm:text-lg">Error loading tools: {error}</p>
          ) : toolPosts.length > 0 ? (
            toolPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  id: post.id,
                  slug: post.slug,
                  title: post.title,
                  description: post.description,
                  category: post.category,
                  tags: post.tags,
                  date: post.date,
                  authorId: post.authorId,
                  content: post.content,
                  readTime: post.readTime || '5 min',
                  outline: post.outline,
                  thumbnailUrl: post.thumbnailUrl,
                  micrographics: post.micrographics || {
                    topLeft: '',
                    topRight: '',
                    bottomLeft: '',
                  },
                }}
              />
            ))
          ) : (
            <p className="col-span-12 text-text-secondary text-base sm:text-lg">No tools have been posted yet. Check back soon!</p>
          )}
        </div>
      </div>
      
    </>
  );
};
export default Tools;
