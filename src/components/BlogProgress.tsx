"use client";

import React from "react";
import { BlogJobStatusResponse } from "../types/blog-api";

interface BlogProgressProps {
  status: BlogJobStatusResponse | null;
  className?: string;
}

export const BlogProgress: React.FC<BlogProgressProps> = ({
  status,
  className = "",
}) => {
  if (!status) {
    return null;
  }

  const getStatusInfo = (jobStatus: string) => {
    switch (jobStatus) {
      case "pending":
        return {
          label: "En attente",
          color: "bg-gray-200",
          textColor: "text-gray-700",
          icon: "⏳",
        };
      case "generating_outline":
        return {
          label: "Recherche SEO et planification",
          color: "bg-blue-500",
          textColor: "text-blue-700",
          icon: "🔍",
        };
      case "writing_chapters":
        return {
          label: "Rédaction de l'article",
          color: "bg-indigo-500",
          textColor: "text-indigo-700",
          icon: "✍️",
        };
      case "finalizing":
        return {
          label: "Optimisation SEO et scoring",
          color: "bg-purple-500",
          textColor: "text-purple-700",
          icon: "📊",
        };
      case "completed":
        return {
          label: "Article terminé",
          color: "bg-green-500",
          textColor: "text-green-700",
          icon: "✅",
        };
      case "failed":
        return {
          label: "Erreur",
          color: "bg-red-500",
          textColor: "text-red-700",
          icon: "❌",
        };
      default:
        return {
          label: "En cours",
          color: "bg-gray-500",
          textColor: "text-gray-700",
          icon: "⚙️",
        };
    }
  };

  const statusInfo = getStatusInfo(status.status);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{statusInfo.icon}</span>
            <h3 className={`text-lg font-semibold ${statusInfo.textColor}`}>
              {statusInfo.label}
            </h3>
          </div>
          <span className="text-sm text-gray-600">{status.progress}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${statusInfo.color}`}
            style={{ width: `${status.progress}%` }}
          ></div>
        </div>

        {status.message && (
          <p className="text-sm text-gray-600 mt-2">{status.message}</p>
        )}
      </div>

      {status.status === "completed" && (
        <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
          <p className="text-green-800 font-medium">
            🎉 Votre article de blog est prêt !
          </p>
          <p className="text-green-700 text-sm mt-1">
            Vous pouvez maintenant le consulter, l'éditer ou le publier.
          </p>
        </div>
      )}

      {status.status === "failed" && (
        <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-200">
          <p className="text-red-800 font-medium">
            ❌ Une erreur s'est produite
          </p>
          <p className="text-red-700 text-sm mt-1">
            {status.message ||
              "Impossible de générer l'article. Veuillez réessayer."}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                [
                  "generating_outline",
                  "writing_chapters",
                  "finalizing",
                  "completed",
                ].includes(status.status)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <p className="text-xs mt-1 text-gray-600">Recherche</p>
          </div>
          <div>
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                ["writing_chapters", "finalizing", "completed"].includes(
                  status.status
                )
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <p className="text-xs mt-1 text-gray-600">Rédaction</p>
          </div>
          <div>
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                ["finalizing", "completed"].includes(status.status)
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
            <p className="text-xs mt-1 text-gray-600">Optimisation</p>
          </div>
          <div>
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                status.status === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              ✓
            </div>
            <p className="text-xs mt-1 text-gray-600">Terminé</p>
          </div>
        </div>
      </div>
    </div>
  );
};
