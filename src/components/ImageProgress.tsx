"use client";

import React from "react";
import { Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import type { ImageStatusResponse } from "../types/image-api";

interface ImageProgressProps {
  status: ImageStatusResponse | null;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: "En attente",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: Loader2,
  },
  INITIALIZING: {
    label: "Initialisation",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Sparkles,
  },
  GENERATING: {
    label: "Génération en cours",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Loader2,
  },
  SAVING: {
    label: "Sauvegarde",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    icon: Loader2,
  },
  COMPLETED: {
    label: "Terminé",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Échec",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
  },
};

export const ImageProgress: React.FC<ImageProgressProps> = ({
  status,
  className = "",
}) => {
  if (!status) {
    return null;
  }

  const config = statusConfig[status.status] || statusConfig.PENDING;
  const Icon = config.icon;
  const shouldAnimate = [
    "PENDING",
    "INITIALIZING",
    "GENERATING",
    "SAVING",
  ].includes(status.status);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Icône de statut */}
        <div className={`p-3 rounded-full ${config.bgColor}`}>
          <Icon
            className={`w-6 h-6 ${config.color} ${
              shouldAnimate ? "animate-spin" : ""
            }`}
          />
        </div>

        {/* Informations de statut */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-semibold ${config.color}`}>
              {config.label}
            </h3>
            {status.progress !== undefined && status.progress > 0 && (
              <span className="text-sm font-medium text-gray-600">
                {status.progress}%
              </span>
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600">{status.message}</p>

          {/* Barre de progression */}
          {status.progress !== undefined && status.progress > 0 && (
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          )}

          {/* Timestamps */}
          {(status.created_at || status.updated_at) && (
            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              {status.created_at && (
                <div>
                  Créé:{" "}
                  {new Date(status.created_at).toLocaleTimeString("fr-FR")}
                </div>
              )}
              {status.updated_at && (
                <div>
                  Mis à jour:{" "}
                  {new Date(status.updated_at).toLocaleTimeString("fr-FR")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ID du job */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500 mb-1">ID du job</div>
        <code className="text-xs font-mono text-gray-700 break-all">
          {status.job_id}
        </code>
      </div>
    </div>
  );
};
