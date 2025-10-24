"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  PenTool,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
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
          color: "bg-dark-700",
          glowColor: "from-dark-600 to-dark-700",
          textColor: "text-dark-300",
          icon: Loader2,
          iconColor: "text-dark-400",
        };
      case "generating_outline":
        return {
          label: "Recherche SEO et planification",
          color: "bg-primary-500",
          glowColor: "from-primary-600 to-accent-600",
          textColor: "text-primary-300",
          icon: Search,
          iconColor: "text-primary-400",
        };
      case "writing_chapters":
        return {
          label: "Rédaction de l'article",
          color: "bg-accent-500",
          glowColor: "from-accent-600 to-primary-600",
          textColor: "text-accent-300",
          icon: PenTool,
          iconColor: "text-accent-400",
        };
      case "finalizing":
        return {
          label: "Optimisation SEO et scoring",
          color: "bg-purple-500",
          glowColor: "from-purple-600 to-pink-600",
          textColor: "text-purple-300",
          icon: TrendingUp,
          iconColor: "text-purple-400",
        };
      case "completed":
        return {
          label: "Article terminé",
          color: "bg-green-500",
          glowColor: "from-green-600 to-emerald-600",
          textColor: "text-green-300",
          icon: CheckCircle,
          iconColor: "text-green-400",
        };
      case "failed":
        return {
          label: "Erreur",
          color: "bg-red-500",
          glowColor: "from-red-600 to-pink-600",
          textColor: "text-red-300",
          icon: XCircle,
          iconColor: "text-red-400",
        };
      default:
        return {
          label: "En cours",
          color: "bg-dark-600",
          glowColor: "from-dark-600 to-dark-700",
          textColor: "text-dark-300",
          icon: Loader2,
          iconColor: "text-dark-400",
        };
    }
  };

  const statusInfo = getStatusInfo(status.status);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8 ${className}`}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusInfo.glowColor} flex items-center justify-center`}
            >
              <StatusIcon
                className={`w-6 h-6 ${statusInfo.iconColor} ${
                  status.status === "pending" ? "animate-spin" : ""
                }`}
              />
            </div>
            <div>
              <h3
                className={`text-xl font-display font-bold ${statusInfo.textColor}`}
              >
                {statusInfo.label}
              </h3>
              <p className="text-sm text-dark-400 mt-0.5">
                {status.progress}% complété
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full bg-dark-800/50 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-3 rounded-full bg-gradient-to-r ${statusInfo.glowColor} shadow-glow`}
          />
        </div>

        {status.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-dark-300 mt-4 p-3 bg-dark-800/30 rounded-lg border border-dark-700/30"
          >
            {status.message}
          </motion.p>
        )}
      </div>

      {status.status === "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-6 bg-green-500/10 rounded-xl border border-green-500/30"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-300 font-semibold text-lg">
                🎉 Votre article de blog est prêt !
              </p>
              <p className="text-green-200/80 text-sm mt-1">
                Vous pouvez maintenant le consulter, l'éditer ou le publier.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {status.status === "failed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-6 bg-red-500/10 rounded-xl border border-red-500/30"
        >
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold text-lg">
                ❌ Une erreur s'est produite
              </p>
              <p className="text-red-200/80 text-sm mt-1">
                {status.message ||
                  "Impossible de générer l'article. Veuillez réessayer."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-8 pt-6 border-t border-dark-800/50">
        <div className="grid grid-cols-4 gap-4">
          {[
            { step: 1, label: "Recherche", status: "generating_outline" },
            { step: 2, label: "Rédaction", status: "writing_chapters" },
            { step: 3, label: "Optimisation", status: "finalizing" },
            { step: 4, label: "Terminé", status: "completed" },
          ].map((item, index) => {
            const isActive =
              item.status === status.status ||
              (item.status === "completed" && status.status === "completed") ||
              (index === 0 &&
                [
                  "generating_outline",
                  "writing_chapters",
                  "finalizing",
                  "completed",
                ].includes(status.status)) ||
              (index === 1 &&
                ["writing_chapters", "finalizing", "completed"].includes(
                  status.status
                )) ||
              (index === 2 &&
                ["finalizing", "completed"].includes(status.status));

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold text-sm mb-2 transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-glow"
                      : "bg-dark-800/50 text-dark-500 border border-dark-700/30"
                  }`}
                >
                  {item.step === 4 ? "✓" : item.step}
                </div>
                <p
                  className={`text-xs ${
                    isActive ? "text-white" : "text-dark-500"
                  }`}
                >
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
