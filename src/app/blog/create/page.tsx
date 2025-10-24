"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  FileText,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { BlogCreationForm } from "../../../components/BlogCreationForm";
import { BlogProgress } from "../../../components/BlogProgress";
import { useBlogCreation } from "../../../hooks/useBlogCreation";
import { useBlogJob } from "../../../hooks/useBlogJob";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function CreateBlogPage() {
  const router = useRouter();
  const { isLoading, error, jobId, createBlog, clearError } = useBlogCreation();
  const { status, result, pollJob, stopPolling } = useBlogJob();

  useEffect(() => {
    if (jobId) {
      pollJob(jobId);
    }
  }, [jobId, pollJob]);

  useEffect(() => {
    if (result) {
      // Rediriger vers la page de l'article une fois terminé
      // Notez : Nous devrons créer l'article côté serveur via le webhook
      // donc nous attendons un peu avant de rediriger
      setTimeout(() => {
        router.push(`/blog`);
      }, 2000);
    }
  }, [result, router]);

  const handleSubmit = async (data: any) => {
    try {
      await createBlog(data);
    } catch (err) {
      console.error("Erreur lors de la création:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-dark">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/blog")}
              className="mb-6 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux articles
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-white">
                  Créer un article de blog
                </h1>
                <p className="text-dark-300 mt-1">
                  Générez un article de blog optimisé SEO avec l'IA
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4"
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-300 mb-1">
                    Une erreur s'est produite
                  </h3>
                  <p className="text-sm text-red-200 mb-2">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-sm text-red-300 hover:text-red-200 underline"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form or Progress */}
          {!jobId ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BlogCreationForm onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <BlogProgress status={status} />

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8"
                >
                  <h2 className="text-3xl font-display font-bold text-white mb-6">
                    {result.title}
                  </h2>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 text-center">
                      <TrendingUp className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {result.seo_score ? Math.round(result.seo_score) : 0}
                      </div>
                      <div className="text-sm text-dark-400">Score SEO</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                      <FileText className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {result.word_count
                          ? result.word_count.toLocaleString()
                          : 0}
                      </div>
                      <div className="text-sm text-dark-400">Mots</div>
                    </div>
                    <div className="bg-accent-500/10 border border-accent-500/20 rounded-xl p-4 text-center">
                      <Sparkles className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {result.sections?.length || 0}
                      </div>
                      <div className="text-sm text-dark-400">Sections</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                      <Tag className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {result.tags?.length || 0}
                      </div>
                      <div className="text-sm text-dark-400">Tags SEO</div>
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-dark-300 mb-3">
                      Meta-description
                    </h3>
                    <p className="text-dark-200 text-sm bg-dark-800/50 border border-dark-700/50 p-4 rounded-lg">
                      {result.meta_description || "Aucune meta-description"}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-dark-300 mb-3">
                      Mots-clés principaux
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.main_keywords?.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-block bg-accent-500/10 text-accent-300 text-sm px-4 py-2 rounded-lg border border-accent-500/20"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="text-center mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-300 text-lg font-semibold">
                      ✅ Article généré avec succès ! Redirection en cours...
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
