/**
 * Page: Blog Post Detail
 * Page détaillée d'un article de blog avec commentaires
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useBlogComments } from '@/hooks/useBlogComments';
import { motion } from 'framer-motion';
import { generateArticleJsonLd } from '@/lib/blog-metadata';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author: {
    id: string;
    name: string | null;
    avatar: string | null;
    bio?: string;
  };
  category?: string;
  tags?: string;
  publishedAt?: string;
  readingTime?: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');

  const { comments, createComment, isLoading: commentsLoading } = useBlogComments({
    postId: post?.id,
  });

  // Charger l'article
  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/blog/posts/${slug}`);
        if (!response.ok) {
          throw new Error('Article non trouvé');
        }
        const data = await response.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post || !commentContent.trim()) return;

    try {
      await createComment({
        postId: post.id,
        content: commentContent,
      });
      setCommentContent('');
      alert('Commentaire envoyé ! Il sera visible après modération.');
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post?.title || '';

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Article non trouvé</h1>
          <p className="text-slate-400 mb-8">{error || 'Cet article n\'existe pas ou n\'est plus disponible.'}</p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            ← Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const tags = post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [];

  // JSON-LD Schema pour SEO
  const jsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    image: post.coverImage,
    url: `/blog/${post.slug}`,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    author: post.author.name || undefined,
    tags,
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Retour au blog</span>
            </Link>

            {/* Share Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 text-slate-400 hover:text-[#1DA1F2] hover:bg-slate-800 rounded-lg transition-colors"
                title="Partager sur Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 text-slate-400 hover:text-[#0A66C2] hover:bg-slate-800 rounded-lg transition-colors"
                title="Partager sur LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 text-slate-400 hover:text-[#4267B2] hover:bg-slate-800 rounded-lg transition-colors"
                title="Partager sur Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover Image */}
        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 rounded-2xl overflow-hidden"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </motion.div>
        )}

        {/* Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-6">
            {post.publishedAt && (
              <span>
                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
            {post.readingTime && (
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{post.readingTime} min de lecture</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.viewsCount} vues</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-slate-300 mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Author */}
          <div className="flex items-center space-x-4 pb-8 border-b border-slate-800">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name || 'Author'}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {(post.author.name || 'A')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-white font-medium">{post.author.name || 'Auteur'}</div>
              {post.author.bio && <div className="text-slate-400 text-sm">{post.author.bio}</div>}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-lg max-w-none mb-12"
        >
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-4xl font-bold text-white mt-8 mb-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
              p: ({ node, ...props }) => <p className="text-slate-300 mb-4 leading-relaxed" {...props} />,
              a: ({ node, ...props }) => <a className="text-violet-400 hover:text-violet-300 underline" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-slate-300 mb-4 space-y-2" {...props} />,
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code className="bg-slate-800 text-violet-400 px-2 py-1 rounded" {...props} />
                ) : (
                  <code className="block bg-slate-800 text-slate-300 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
                ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-violet-600 pl-4 py-2 italic text-slate-400 my-6" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* Tags */}
        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-slate-800"
          >
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            Commentaires ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Partagez votre avis..."
              rows={4}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
            />
            <button
              type="submit"
              disabled={commentsLoading || !commentContent.trim()}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Envoyer le commentaire
            </button>
            <p className="text-sm text-slate-500 mt-2">
              Votre commentaire sera visible après modération.
            </p>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {commentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 rounded-lg">
                <p className="text-slate-400">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-900/50 rounded-lg p-6"
                >
                  <div className="flex items-start space-x-4">
                    {comment.author.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name || 'User'}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(comment.author.name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-white font-medium">
                          {comment.author.name || 'Utilisateur'}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </article>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm">
              © 2025 Sorami. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/legal/terms" className="text-slate-500 hover:text-slate-400 text-sm">
                CGU
              </Link>
              <Link href="/legal/privacy" className="text-slate-500 hover:text-slate-400 text-sm">
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
