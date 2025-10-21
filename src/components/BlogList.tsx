"use client";

import React from "react";
import Link from "next/link";
import { BlogArticle } from "../types/blog-api";

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
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
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun article pour le moment
        </h3>
        <p className="text-gray-500 mb-4">
          Commencez par créer votre premier article de blog optimisé SEO
        </p>
        <Link
          href="/blog/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Créer un article
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <Link
          key={blog.id}
          href={`/blog/${blog.id}`}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
        >
          <div className="flex items-start justify-between mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                blog.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800"
                  : blog.status === "GENERATING"
                  ? "bg-yellow-100 text-yellow-800"
                  : blog.status === "REVIEW"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
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
              <div className="flex items-center">
                <span className="text-sm font-semibold text-gray-700">
                  SEO: {Math.round(blog.seoScore)}/100
                </span>
                {blog.seoScore >= 90 && <span className="ml-1">🏆</span>}
                {blog.seoScore >= 80 && blog.seoScore < 90 && (
                  <span className="ml-1">✅</span>
                )}
                {blog.seoScore >= 70 && blog.seoScore < 80 && (
                  <span className="ml-1">👍</span>
                )}
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {blog.title}
          </h3>

          {blog.metaDescription && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {blog.metaDescription}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {blog.tags &&
              blog.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
            <div className="flex items-center">
              {blog.wordCount && (
                <span className="mr-3">
                  📝 {blog.wordCount.toLocaleString()} mots
                </span>
              )}
            </div>
            <span>
              {new Date(blog.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
