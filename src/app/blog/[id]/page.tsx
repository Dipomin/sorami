"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Share2,
  Eye,
  TrendingUp,
  FileText,
  Tag,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  fetchBlogArticleById,
  updateBlogArticle,
  deleteBlogArticle,
} from "@/lib/api-blog";
import { BlogArticle } from "@/types/blog-api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [blog, setBlog] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setArticleId(p.id));
  }, [params]);

  useEffect(() => {
    if (articleId) {
      loadBlog();
    }
  }, [articleId]);

  const loadBlog = async () => {
    if (!articleId) return;
    try {
      setLoading(true);
      const data = await fetchBlogArticleById(articleId);
      setBlog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!blog) return;

    try {
      await updateBlogArticle(blog.id, {
        status: "PUBLISHED",
        visibility: "PUBLIC",
      });
      await loadBlog();
    } catch (err) {
      alert("Erreur lors de la publication");
    }
  };

  const handleDelete = async () => {
    if (!blog) return;

    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }

    try {
      await deleteBlogArticle(blog.id);
      router.push("/blog");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-dark-300">Chargement de l'article...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !blog) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Erreur</h2>
            <p className="text-dark-300 mb-6">
              {error || "Article non trouvé"}
            </p>
            <Button variant="outline" onClick={() => router.push("/blog")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux articles
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header avec actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push("/blog")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux articles
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? "Annuler" : "Éditer"}
                </Button>
                {blog.status !== "PUBLISHED" && (
                  <Button
                    variant="default"
                    onClick={handlePublish}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Publier
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </div>
            </div>

            {/* Métriques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {blog.seoScore ? Math.round(blog.seoScore) : "-"}
                    </div>
                    <div className="text-xs text-dark-400">Score SEO</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {blog.wordCount?.toLocaleString() || "-"}
                    </div>
                    <div className="text-xs text-dark-400">Mots</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {blog.sections?.length || "-"}
                    </div>
                    <div className="text-xs text-dark-400">Sections</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {blog.tags?.length || "-"}
                    </div>
                    <div className="text-xs text-dark-400">Tags</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Contenu principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8 md:p-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
              {blog.title}
            </h1>

            {blog.metaDescription && (
              <div className="mb-8 p-6 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary-300 mb-2">
                      Meta-description
                    </h3>
                    <p className="text-dark-200 text-sm leading-relaxed">
                      {blog.metaDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {blog.mainKeywords && blog.mainKeywords.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-dark-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  Mots-clés principaux
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.mainKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block bg-accent-500/10 text-accent-300 text-sm px-4 py-2 rounded-lg border border-accent-500/20"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {blog.introduction && (
              <div className="mb-10 pb-8 border-b border-dark-800/50">
                <p className="text-lg text-dark-200 leading-relaxed">
                  {blog.introduction}
                </p>
              </div>
            )}

            {blog.sections && blog.sections.length > 0 && (
              <div className="mb-10 space-y-8">
                {blog.sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                      {section.heading}
                    </h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-dark-200 leading-relaxed whitespace-pre-wrap text-base">
                        {section.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {blog.conclusion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-10 pt-8 border-t border-dark-800/50"
              >
                <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                  Conclusion
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-dark-200 leading-relaxed">
                    {blog.conclusion}
                  </p>
                </div>
              </motion.div>
            )}

            {blog.tags && blog.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-8 border-t border-dark-800/50"
              >
                <h3 className="text-sm font-semibold text-dark-300 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary-400" />
                  Tags SEO
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-primary-500/10 text-primary-300 text-sm px-3 py-1.5 rounded-lg border border-primary-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
