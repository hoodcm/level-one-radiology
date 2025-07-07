
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import type { Post } from '@/lib/postConversion';
import { useState } from 'react';
import { PostCardImage } from './PostCardImage';
import { PostCardContent } from './PostCardContent';
import { PostCardActions } from './PostCardActions';
import { CRTPreviewOverlay } from './CRTPreviewOverlay';

interface PostCardProps {
  post: Post;
  author?: {
    id: string;
    name: string;
    slug: string;
  };
}

export function PostCard({ post, author }: PostCardProps) {
  const navigate = useNavigate();
  const [activePreviewSlug, setActivePreviewSlug] = useState<string | null>(null);
  const previewOpen = activePreviewSlug === post.slug;

  // Determine if post has interactive imaging based on category and tags
  const isCaseStudy = post.category === 'Case Study';
  const hasImaging = isCaseStudy && post.tags.some(tag => 
    ['CT', 'MRI', 'X-Ray', 'Ultrasound', 'Nuclear Medicine'].some(modality => 
      tag.toLowerCase().includes(modality.toLowerCase())
    )
  );

  const handlePreviewToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') return;
    
    if (previewOpen) {
      setActivePreviewSlug(null);
    } else {
      setActivePreviewSlug(post.slug);
    }
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.blur();
    }
  };

  const handleViewImages = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const caseId = post.slug.replace(/[^a-zA-Z0-9]/g, '-');
    navigate(`/viewer/${caseId}`);
  };

  const handleClosePreview = () => {
    setActivePreviewSlug(null);
  };

  return (
    <>
      <div
        className={clsx(
          "col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 xl:col-span-3 2xl:col-span-2",
          { "group sm:hover-lift": !previewOpen }
        )}
      >
        <article 
          className={clsx(
            "bg-surface-card rounded-lg shadow-[6px_6px_0px_theme(colors.shadow-hard)] border-[2.5px] border-border md:group-hover:border-accent overflow-hidden relative h-full transform transition-all duration-200 ease-out",
            // Mobile layout: horizontal flex
            "flex sm:flex-col",
            {
              "!-translate-y-0.5": previewOpen,
              "!border-accent": previewOpen,
              "md:group-hover:-translate-y-0.5": !previewOpen
            }
          )} 
          role="article"
          aria-label={`Article: ${post.title}`}
        >
          <Link 
            to={isCaseStudy ? `/cases/${post.slug}` : `/posts/${post.slug}`} 
            className="flex-1 flex sm:flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-lg"
            aria-describedby={`post-${post.id}-description`}
          >
            {/* Mobile: Content on left, Image on right */}
            <div className="flex-1 flex flex-col justify-between sm:order-1">
              <PostCardContent post={post} />
            </div>
            <div className="w-1/3 sm:w-full sm:order-0">
              <PostCardImage post={post} hasImaging={hasImaging} />
            </div>
          </Link>

          <PostCardActions
            post={post}
            hasImaging={hasImaging}
            onViewImages={handleViewImages}
          />
        </article>
      </div>

      <CRTPreviewOverlay
        post={post}
        hasImaging={hasImaging}
        onClose={handleClosePreview}
        onViewImages={handleViewImages}
      />
    </>
  );
}
