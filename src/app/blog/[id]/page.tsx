"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchBlogArticleById,
  updateBlogArticle,
  deleteBlogArticle,
} from "@/lib/api-blog";
import { BlogArticle } from "@/types/blog-api";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
          <p className="text-gray-600">{error || "Article non trouvé"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header avec actions */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/blog")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Retour aux articles
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              {isEditing ? "Annuler" : "Éditer"}
            </button>
            {blog.status !== "PUBLISHED" && (
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Publier
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {blog.seoScore ? Math.round(blog.seoScore) : "-"}
            </div>
            <div className="text-sm text-gray-600">Score SEO</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {blog.wordCount?.toLocaleString() || "-"}
            </div>
            <div className="text-sm text-gray-600">Mots</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {blog.sections?.length || "-"}
            </div>
            <div className="text-sm text-gray-600">Sections</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {blog.tags?.length || "-"}
            </div>
            <div className="text-sm text-gray-600">Tags</div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>

          {blog.metaDescription && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Meta-description
              </h3>
              <p className="text-blue-800 text-sm">{blog.metaDescription}</p>
            </div>
          )}

          {blog.mainKeywords && blog.mainKeywords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Mots-clés principaux
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.mainKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {blog.introduction && (
            <div className="mb-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {blog.introduction}
                </p>
              </div>
            </div>
          )}

          {blog.sections && blog.sections.length > 0 && (
            <div className="mb-8 space-y-6">
              {blog.sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {section.heading}
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {blog.conclusion && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Conclusion
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {blog.conclusion}
                </p>
              </div>
            </div>
          )}

          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Tags SEO
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
