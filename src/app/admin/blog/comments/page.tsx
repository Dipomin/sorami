/**
 * Page: Admin Blog Comments Moderation
 * Modération des commentaires de blog
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useBlogComments } from "@/hooks/useBlogComments";
import { motion } from "framer-motion";

export default function AdminCommentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  const {
    comments,
    pagination,
    isLoading,
    approveComment,
    rejectComment,
    markAsSpam,
    deleteComment,
  } = useBlogComments({
    status: statusFilter || undefined,
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-600 text-white",
      APPROVED: "bg-green-600 text-white",
      REJECTED: "bg-red-600 text-white",
      SPAM: "bg-orange-600 text-white",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-slate-600"
        }`}
      >
        {status}
      </span>
    );
  };

  const handleAction = async (id: string, action: string) => {
    try {
      switch (action) {
        case "approve":
          await approveComment(id);
          alert("Commentaire approuvé !");
          break;
        case "reject":
          await rejectComment(id);
          alert("Commentaire rejeté !");
          break;
        case "spam":
          await markAsSpam(id);
          alert("Marqué comme spam !");
          break;
        case "delete":
          if (confirm("Supprimer ce commentaire définitivement ?")) {
            await deleteComment(id);
            alert("Commentaire supprimé !");
          }
          break;
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Commentaires</h1>
          <p className="text-slate-400">
            Modérez les commentaires de vos articles
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {[
          { value: "", label: "Tous", count: null },
          { value: "PENDING", label: "En attente", count: null },
          { value: "APPROVED", label: "Approuvés", count: null },
          { value: "REJECTED", label: "Rejetés", count: null },
          { value: "SPAM", label: "Spam", count: null },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? "bg-violet-600 text-white shadow-lg"
                : "bg-slate-900/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-12 text-center">
          <svg
            className="w-16 h-16 text-slate-600 mx-auto mb-4"
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
          <p className="text-slate-400">Aucun commentaire trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-lg p-6 hover:bg-slate-900/70 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {comment.author.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name || "User"}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                      {(comment.author.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {comment.author.name || "Utilisateur"}
                      </span>
                      {getStatusBadge(comment.status)}
                    </div>
                    <p className="text-sm text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Article Reference */}
              {comment.post && (
                <div className="mb-3 pb-3 border-b border-slate-800">
                  <Link
                    href={`/blog/${comment.post.slug}`}
                    target="_blank"
                    className="text-sm text-violet-400 hover:text-violet-300 flex items-center space-x-1"
                  >
                    <span>Sur l'article: {comment.post.title}</span>
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                </div>
              )}

              {/* Content */}
              <p className="text-slate-300 mb-4 whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {comment.status !== "APPROVED" && (
                  <button
                    onClick={() => handleAction(comment.id, "approve")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    ✓ Approuver
                  </button>
                )}

                {comment.status !== "REJECTED" && (
                  <button
                    onClick={() => handleAction(comment.id, "reject")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    ✗ Rejeter
                  </button>
                )}

                {comment.status !== "SPAM" && (
                  <button
                    onClick={() => handleAction(comment.id, "spam")}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    ⚠ Spam
                  </button>
                )}

                <button
                  onClick={() => handleAction(comment.id, "delete")}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                >
                  🗑 Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span className="text-slate-400 px-4">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
