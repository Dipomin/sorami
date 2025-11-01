/**
 * Page: Admin Blog Statistics
 * Statistiques du blog
 */

"use client";

import { useState, useEffect } from "react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useBlogComments } from "@/hooks/useBlogComments";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { motion } from "framer-motion";

export default function AdminStatsPage() {
  const { posts } = useBlogPosts({ limit: 1000 }); // Récupérer tous les posts
  const { comments } = useBlogComments({ limit: 1000 });
  const { categories } = useBlogCategories(true);

  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalComments: 0,
    pendingComments: 0,
    approvedComments: 0,
    totalCategories: 0,
    avgReadingTime: 0,
  });

  const [topPosts, setTopPosts] = useState<any[]>([]);

  useEffect(() => {
    if (posts.length > 0) {
      const totalViews = posts.reduce((sum, post) => sum + post.viewsCount, 0);
      const publishedPosts = posts.filter((p) => p.published).length;
      const draftPosts = posts.filter((p) => p.status === "DRAFT").length;
      const avgReadingTime = Math.round(
        posts.reduce((sum, post) => sum + (post.readingTime || 0), 0) /
          posts.length
      );

      setStats((prev) => ({
        ...prev,
        totalPosts: posts.length,
        publishedPosts,
        draftPosts,
        totalViews,
        avgReadingTime,
      }));

      // Top 5 articles les plus vus
      const sorted = [...posts]
        .sort((a, b) => b.viewsCount - a.viewsCount)
        .slice(0, 5);
      setTopPosts(sorted);
    }
  }, [posts]);

  useEffect(() => {
    if (comments.length > 0) {
      const pending = comments.filter((c) => c.status === "PENDING").length;
      const approved = comments.filter((c) => c.status === "APPROVED").length;

      setStats((prev) => ({
        ...prev,
        totalComments: comments.length,
        pendingComments: pending,
        approvedComments: approved,
      }));
    }
  }, [comments]);

  useEffect(() => {
    if (categories.length > 0) {
      setStats((prev) => ({
        ...prev,
        totalCategories: categories.length,
      }));
    }
  }, [categories]);

  const statCards = [
    {
      title: "Articles Totaux",
      value: stats.totalPosts,
      icon: "📝",
      color: "from-violet-600 to-indigo-600",
      detail: `${stats.publishedPosts} publiés, ${stats.draftPosts} brouillons`,
    },
    {
      title: "Vues Totales",
      value: stats.totalViews.toLocaleString("fr-FR"),
      icon: "👁️",
      color: "from-blue-600 to-cyan-600",
      detail: `${Math.round(
        stats.totalViews / (stats.publishedPosts || 1)
      )} vues/article en moyenne`,
    },
    {
      title: "Commentaires",
      value: stats.totalComments,
      icon: "💬",
      color: "from-green-600 to-emerald-600",
      detail: `${stats.pendingComments} en attente, ${stats.approvedComments} approuvés`,
    },
    {
      title: "Catégories",
      value: stats.totalCategories,
      icon: "🏷️",
      color: "from-orange-600 to-red-600",
      detail: `${Math.round(
        stats.totalPosts / (stats.totalCategories || 1)
      )} articles/catégorie`,
    },
    {
      title: "Temps de Lecture Moyen",
      value: `${stats.avgReadingTime} min`,
      icon: "⏱️",
      color: "from-purple-600 to-pink-600",
      detail: "Par article",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Statistiques</h1>
        <p className="text-slate-400">Vue d'ensemble de votre blog</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 hover:bg-slate-900/70 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center text-2xl`}
              >
                {card.icon}
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">
              {card.title}
            </h3>
            <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
            <p className="text-slate-500 text-sm">{card.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Top Posts */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">📈 Top 5 Articles</h2>
        <div className="space-y-4">
          {topPosts.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Aucun article publié
            </p>
          ) : (
            topPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-violet-600 rounded-full text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>{post.viewsCount} vues</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>{post._count?.comments || 0} commentaires</span>
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="p-2 text-slate-400 hover:text-violet-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Categories Distribution */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          📊 Répartition par Catégorie
        </h2>
        <div className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Aucune catégorie créée
            </p>
          ) : (
            categories
              .sort((a, b) => (b.postsCount || 0) - (a.postsCount || 0))
              .map((category, index) => {
                const percentage =
                  stats.totalPosts > 0
                    ? Math.round(
                        ((category.postsCount || 0) / stats.totalPosts) * 100
                      )
                    : 0;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span style={{ color: category.color }}>
                          {category.icon || "📁"}
                        </span>
                        <span className="text-white">{category.name}</span>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {category.postsCount || 0} articles ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: category.color || "#6366f1",
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
