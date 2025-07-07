
import { Seo } from "@/components/Seo";
import { PostCard } from "@/components/PostCard";
import { useAllPosts } from "@/hooks/useAsyncPosts";
import { authors } from "@/data/authors";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Users, BookOpen, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from 'react';

const Index = () => {
  const { posts, loading } = useAllPosts();
  const featuredPosts = posts.slice(0, 6);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <div>
      <Seo 
        title="Level One Radiology"
        description="Advanced radiology education and case studies for medical professionals. Explore comprehensive imaging cases, expert insights, and cutting-edge diagnostic techniques."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Level One Radiology",
          "description": "Advanced radiology education and case studies for medical professionals",
          "url": "https://leveloneradiology.com"
        }}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-bg">
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="flex items-center gap-2 bg-accent text-accent-highlight-text px-4 sm:px-6 py-2 sm:py-3 border-2 sm:border-4 border-border rounded-lg shadow-[4px_4px_0px_0px_hsl(var(--shadow-hard))] sm:shadow-[8px_8px_0px_0px_hsl(var(--shadow-hard))]">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Advanced Radiology</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8">
              <span className="bg-surface-card text-text-primary px-3 sm:px-4 py-1 sm:py-2 border-2 sm:border-4 border-border rounded-lg shadow-[6px_6px_0px_0px_hsl(var(--shadow-hard))] sm:shadow-[12px_12px_0px_0px_hsl(var(--shadow-hard))] inline-block mb-2 sm:mb-4">
                LEVEL ONE
              </span>
              <br />
              <span className="bg-accent text-accent-highlight-text px-3 sm:px-4 py-1 sm:py-2 border-2 sm:border-4 border-border rounded-lg shadow-[6px_6px_0px_0px_hsl(var(--shadow-hard))] sm:shadow-[12px_12px_0px_0px_hsl(var(--shadow-hard))] inline-block">
                RADIOLOGY
              </span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-8 sm:mb-12 max-w-3xl mx-auto leading-tight uppercase tracking-wide text-text-primary">
              DECISIVE THINKING IN EMERGENCY IMAGING
            </p>
            
            {/* Mobile-first Search Field */}
            <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="bg-surface-card border-2 sm:border-4 border-border rounded-lg shadow-[8px_8px_0px_0px_hsl(var(--shadow-hard))] sm:shadow-[16px_16px_0px_0px_hsl(var(--shadow-hard))]">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 p-3 sm:p-2">
                    <div className="flex items-center flex-1 min-w-0">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 text-text-primary mr-3 sm:mr-4 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH CASES, ESSAYS..."
                        className="flex-1 bg-transparent text-text-primary text-sm sm:text-xl font-black placeholder:text-text-secondary placeholder:font-black focus:outline-none uppercase tracking-wide min-w-0"
                        autoComplete="off"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-accent text-accent-highlight-text px-4 sm:px-6 py-2 sm:py-3 border-2 sm:border-4 border-border font-black text-sm sm:text-lg uppercase tracking-wider rounded-md hover:shadow-[2px_2px_0px_0px_hsl(var(--shadow-hard))] sm:hover:shadow-[4px_4px_0px_0px_hsl(var(--shadow-hard))] hover:translate-x-0.5 hover:translate-y-0.5 sm:hover:translate-x-1 sm:hover:translate-y-1 transition-all duration-100 flex-shrink-0"
                    >
                      GO
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Secondary action */}
            <div className="flex justify-center">
              <Link
                to="/about"
                className="bg-surface-card text-text-primary px-6 sm:px-8 py-3 sm:py-4 border-2 sm:border-4 border-border font-black text-sm sm:text-lg uppercase tracking-wider rounded-lg shadow-[4px_4px_0px_0px_hsl(var(--shadow-hard))] sm:shadow-[8px_8px_0px_0px_hsl(var(--shadow-hard))] hover:shadow-[2px_2px_0px_0px_hsl(var(--shadow-hard))] sm:hover:shadow-[4px_4px_0px_0px_hsl(var(--shadow-hard))] hover:translate-x-0.5 hover:translate-y-0.5 sm:hover:translate-x-1 sm:hover:translate-y-1 transition-all duration-100"
              >
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center bg-accent p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              <div className="bg-black w-16 h-16 flex items-center justify-center mx-auto mb-4 border-4 border-white">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-black text-black mb-2">500+</h3>
              <p className="text-black font-bold uppercase tracking-wide">IMAGING CASES</p>
            </div>
            <div className="text-center bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-accent w-16 h-16 flex items-center justify-center mx-auto mb-4 border-4 border-black">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-4xl font-black text-black mb-2">10K+</h3>
              <p className="text-black font-bold uppercase tracking-wide">PROFESSIONALS</p>
            </div>
            <div className="text-center bg-black p-8 border-4 border-white shadow-[8px_8px_0px_0px_rgba(206,206,206,1)] transform -rotate-1">
              <div className="bg-accent w-16 h-16 flex items-center justify-center mx-auto mb-4 border-4 border-black">
                <Activity className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-4xl font-black text-white mb-2">50+</h3>
              <p className="text-white font-bold uppercase tracking-wide">SUBSPECIALTIES</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                Featured Cases
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl">
                Dive into carefully selected imaging cases that challenge and enhance your diagnostic skills.
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex shrink-0">
              <Link to="/codex">
                View All Cases
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {loading ? (
              // Show loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              featuredPosts.map((post) => {
                const author = authors.find(a => a.id === post.authorId);
                return (
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
                    author={author}
                  />
                );
              })
            )}
          </div>
          
          <div className="flex justify-center mt-8 md:mt-12 sm:hidden">
            <Button asChild variant="outline">
              <Link to="/codex">
                View All Cases
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6">
            Ready to Advance Your Radiology Skills?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of medical professionals who trust Level One Radiology for their continuing education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-black font-semibold">
              <Link to="/search">
                <Search className="mr-2 w-5 h-5" />
                Search Cases
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn About Our Approach</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
