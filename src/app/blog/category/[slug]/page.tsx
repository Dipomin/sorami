/**
 * Page: Blog Category
 * Liste des articles d'une catégorie spécifique
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  author: {
    name: string | null;
    avatar: string | null;
  };
  publishedAt?: string;
  readingTime?: number;
  viewsCount: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!categorySlug) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer la catégorie
        const categoriesResponse = await fetch('/api/blog/categories');
        const categories = await categoriesResponse.json();
        const foundCategory = categories.find((c: Category) => c.slug === categorySlug);
        
        if (!foundCategory) {
          throw new Error('Catégorie non trouvée');
        }
        
        setCategory(foundCategory);

        // Récupérer les articles
        const postsResponse = await fetch(
          `/api/blog/posts?category=${foundCategory.id}&page=${pagination.page}&pageSize=${pagination.pageSize}`
        );
        const postsData = await postsResponse.json();
        
        setPosts(postsData.posts || []);
        setPagination(postsData.pagination || pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, pagination.page]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Catégorie non trouvée</h1>
          <p className="text-slate-400 mb-8">{error || 'Cette catégorie n\'existe pas.'}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Retour au blog</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-4"
          >
            {category.icon && (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: category.color || '#6366f1' }}
              >
                {category.icon}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-slate-400">{category.description}</p>
              )}
              <p className="text-sm text-slate-500 mt-2">
                {pagination.total} article{pagination.total > 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 text-slate-700 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Aucun article</h2>
            <p className="text-slate-400">Aucun article n'a encore été publié dans cette catégorie.</p>
          </div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block bg-slate-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-800 hover:border-violet-600 transition-all duration-300 group"
                  >
                    {/* Cover Image */}
                    {post.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                        <div className="flex items-center space-x-3">
                          {post.author.avatar ? (
                            <img
                              src={post.author.avatar}
                              alt={post.author.name || 'Author'}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs">
                              {(post.author.name || 'A')[0].toUpperCase()}
                            </div>
                          )}
                          <span>{post.author.name || 'Auteur'}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          {post.readingTime && (
                            <span className="flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{post.readingTime}min</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.viewsCount}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  ← Précédent
                </button>
                <span className="text-slate-400">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
