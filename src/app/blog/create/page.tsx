"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlogCreationForm } from "../../../components/BlogCreationForm";
import { BlogProgress } from "../../../components/BlogProgress";
import { useBlogCreation } from "../../../hooks/useBlogCreation";
import { useBlogJob } from "../../../hooks/useBlogJob";

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Créer un article de blog
          </h1>
          <p className="mt-2 text-gray-600">
            Générez un article de blog optimisé SEO avec l'aide de
            l'intelligence artificielle
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Une erreur s'est produite
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {!jobId ? (
          <BlogCreationForm onSubmit={handleSubmit} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            <BlogProgress status={status} />

            {result && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {result.title}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.seo_score ? Math.round(result.seo_score) : 0}
                    </div>
                    <div className="text-sm text-gray-600">Score SEO</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {result.word_count
                        ? result.word_count.toLocaleString()
                        : 0}
                    </div>
                    <div className="text-sm text-gray-600">Mots</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.sections?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Sections</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.tags?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tags SEO</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Meta-description
                  </h3>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                    {result.meta_description || "Aucune meta-description"}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Mots-clés principaux
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.main_keywords?.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-green-600 mb-4">
                    ✅ Article généré avec succès ! Redirection en cours...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
