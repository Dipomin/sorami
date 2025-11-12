"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Calendar,
  PenSquare,
  Loader2,
} from "lucide-react";
import { BlogArticle } from "../types/blog-api";
import { Button } from "./ui/button";

// Helper pour parser les tags en toute sécurité
function parseTags(tags: any): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [tags];
    } catch {
      // Si ce n'est pas du JSON, c'est un tag simple
      return [tags];
    }
  }
  return [];
}

interface BlogListProps {
  blogs: BlogArticle[];
  loading?: boolean;
}

export const BlogList: React.FC<BlogListProps> = ({
  blogs,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-dark-300">Chargement des articles...</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-3">
          Aucun article pour le moment
        </h3>
        <p className="text-dark-300 mb-6 max-w-md mx-auto">
          Commencez par créer votre premier article de blog optimisé SEO avec
          l'IA
        </p>
        <Link href="/dashboard/blog/create">
          <Button variant="glow" className="gap-2">
            <PenSquare className="w-5 h-5" />
            Créer mon premier article
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog, index) => (
        <motion.div
          key={blog.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            href={`/dashboard/blog/${blog.id}`}
            className="block group h-full"
          >
            <div className="h-full bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6 hover:border-primary-500/50 hover:shadow-glow transition-all duration-300">
              {/* Status and SEO Score */}
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    blog.status === "PUBLISHED"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : blog.status === "GENERATING"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : blog.status === "REVIEW"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-dark-700/50 text-dark-300 border border-dark-600/30"
                  }`}
                >
                  {blog.status === "PUBLISHED"
                    ? "Publié"
                    : blog.status === "GENERATING"
                    ? "Génération"
                    : blog.status === "REVIEW"
                    ? "Révision"
                    : "Brouillon"}
                </span>
                {blog.seoScore && (
                  <div className="flex items-center gap-2 bg-dark-800/50 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-semibold text-white">
                      {Math.round(blog.seoScore)}
                    </span>
                    {blog.seoScore >= 90 && <span>🏆</span>}
                    {blog.seoScore >= 80 && blog.seoScore < 90 && (
                      <span>✅</span>
                    )}
                    {blog.seoScore >= 70 && blog.seoScore < 80 && (
                      <span>👍</span>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-display font-bold text-white mb-3 line-clamp-2 group-hover:text-primary-300 transition-colors">
                {blog.title}
              </h3>

              {/* Description */}
              {blog.metaDescription && (
                <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                  {blog.metaDescription}
                </p>
              )}

              {/* Tags */}
              {(() => {
                const tags = parseTags(blog.tags);
                return (
                  tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-block bg-primary-500/10 text-primary-300 text-xs px-2 py-1 rounded-lg border border-primary-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="inline-block text-dark-400 text-xs px-2 py-1">
                          +{tags.length - 3}
                        </span>
                      )}
                    </div>
                  )
                );
              })()}

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-dark-400 pt-4 border-t border-dark-800/50">
                <div className="flex items-center gap-2">
                  {blog.wordCount && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{blog.wordCount.toLocaleString()} mots</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
