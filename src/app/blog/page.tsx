"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,
  Eye,
  User,
  Tag,
  ChevronRight,
  Filter,
  BookOpen,
  Video,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogCoverImage } from "@/components/ui/BlogImage";

// Disable static generation for this page (uses Clerk for user context)
export const dynamic = "force-dynamic";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags?: string;
  status: string;
  published: boolean;
  publishedAt?: string;
  readingTime?: number;
  viewsCount: number;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
  };
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface BlogResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const categoryIcons = {
  BookOpen,
  Video,
  FileText,
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres et pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("publishedAt");
  const [totalPages, setTotalPages] = useState(1);

  const limit = 12;

  // Fetch articles
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder: "desc",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`/api/blog/posts?${params}`);
      if (!response.ok)
        throw new Error("Erreur lors du chargement des articles");

      const data: BlogResponse = await response.json();
      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Fetch catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchQuery, selectedCategory, sortBy]);

  // Gestionnaires d'événements
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const parseTags = (tagsString: string | undefined): string[] => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  const getCategoryIcon = (iconName: string | undefined) => {
    if (!iconName || !categoryIcons[iconName as keyof typeof categoryIcons]) {
      return FileText;
    }
    return categoryIcons[iconName as keyof typeof categoryIcons];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Erreur de chargement
          </h1>
          <p className="text-dark-300 mb-8">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Blog{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Sorami
              </span>
            </h1>
            <p className="text-xl text-dark-300 max-w-3xl mx-auto mb-8">
              Découvrez les dernières tendances, guides pratiques et insights
              sur la création de contenu avec l'intelligence artificielle
            </p>

            {/* CTA Subscribe */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-dark-900/50 backdrop-blur-sm border border-primary-500/30 rounded-2xl p-6 max-w-lg mx-auto mb-12"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                Restez à la pointe de l'IA créative
              </h3>
              <p className="text-dark-300 text-sm mb-4">
                Recevez nos derniers guides et astuces directement dans votre
                boîte mail
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                />
                <Button variant="glow" size="sm">
                  S'abonner
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Filtres et recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-12"
          >
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Recherche */}
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher dans les articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </form>

                {/* Filtres par catégorie */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryFilter(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      selectedCategory === null
                        ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                        : "bg-dark-800 text-dark-300 hover:text-white"
                    }`}
                  >
                    Tous
                  </button>
                  {categories.map((category) => {
                    const IconComponent = getCategoryIcon(category.icon);
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryFilter(category.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          selectedCategory === category.name
                            ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                            : "bg-dark-800 text-dark-300 hover:text-white"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {category.name}
                      </button>
                    );
                  })}
                </div>

                {/* Tri */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="publishedAt">Plus récent</option>
                  <option value="viewsCount">Plus populaire</option>
                  <option value="title">Alphabétique</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            // Loading skeleton
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-dark-900/50 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-48 bg-dark-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-dark-800 rounded mb-2"></div>
                  <div className="h-4 bg-dark-800 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-dark-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            // Empty state
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-dark-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun article trouvé
              </h3>
              <p className="text-dark-300 mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
                variant="outline"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            // Articles grid
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="h-full bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-glow">
                      {/* Image de couverture */}
                      <div className="h-48 bg-gradient-to-br from-primary-900/30 to-accent-900/30 relative overflow-hidden">
                        <BlogCoverImage
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Overlay catégorie */}
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-primary-600/90 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                              {post.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="p-6">
                        {/* Meta info */}
                        <div className="flex items-center gap-4 text-sm text-dark-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.publishedAt && formatDate(post.publishedAt)}
                          </div>
                          {post.readingTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readingTime} min
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.viewsCount}
                          </div>
                        </div>

                        {/* Titre */}
                        <h2 className="text-xl font-display font-bold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-dark-300 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Auteur */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center">
                              {post.author.avatar ? (
                                <img
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="text-sm text-dark-300">
                              {post.author.name}
                            </span>
                          </div>

                          <ChevronRight className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform" />
                        </div>

                        {/* Tags */}
                        {post.tags && parseTags(post.tags).length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {parseTags(post.tags)
                              .slice(0, 3)
                              .map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-dark-800/50 text-dark-300 text-xs rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex justify-center mt-12"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Précédent
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "glow" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="text-dark-400">...</span>
                    <Button
                      variant={currentPage === totalPages ? "glow" : "outline"}
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10 h-10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Suivant
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-dark-800/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-primary-900/20 to-accent-900/20 backdrop-blur-sm border border-primary-500/30 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Prêt à créer du contenu IA exceptionnel ?
            </h2>
            <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de créateurs qui utilisent Sorami pour
              transformer leurs idées en contenu professionnel
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="glow" size="lg" className="group">
                  Essayer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  Voir les tarifs
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
