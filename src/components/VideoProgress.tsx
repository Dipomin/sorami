/**
 * Composant d'affichage de la progression de génération de vidéo
 * Affiche le statut en temps réel avec animations
 */

"use client";

import {
  Film,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import type { VideoStatusResponse, VideoStatus } from "@/types/video-api";

interface VideoProgressProps {
  status: VideoStatusResponse;
}

export default function VideoProgress({ status }: VideoProgressProps) {
  const statusConfig: Record<
    VideoStatus,
    { icon: React.ReactNode; color: string; bgColor: string; label: string }
  > = {
    pending: {
      icon: <Clock className="w-5 h-5" />,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      label: "En attente",
    },
    processing: {
      icon: <Loader className="w-5 h-5 animate-spin" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      label: "Initialisation",
    },
    generating: {
      icon: <Film className="w-5 h-5 animate-pulse" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      label: "Génération en cours",
    },
    downloading: {
      icon: <Download className="w-5 h-5 animate-bounce" />,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      label: "Téléchargement",
    },
    completed: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      label: "Terminé",
    },
    failed: {
      icon: <XCircle className="w-5 h-5" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      label: "Échec",
    },
  };

  const config = statusConfig[status.status];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <div className={config.color}>{config.icon}</div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{config.label}</h3>
            <p className="text-sm text-gray-600">{status.message}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {status.progress}%
          </div>
          <div className="text-xs text-gray-500">Progression</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status.status === "failed"
              ? "bg-red-500"
              : status.status === "completed"
              ? "bg-green-500"
              : "bg-gradient-to-r from-blue-500 to-cyan-500"
          }`}
          style={{ width: `${status.progress}%` }}
        >
          {status.status === "generating" && (
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          )}
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Job ID:</span>
          <span className="ml-2 font-mono text-xs text-gray-900">
            {status.job_id.slice(0, 8)}...
          </span>
        </div>
        <div>
          <span className="text-gray-600">Créé à:</span>
          <span className="ml-2 text-gray-900">
            {new Date(status.created_at).toLocaleTimeString("fr-FR")}
          </span>
        </div>
      </div>

      {/* Afficher l'erreur si présente */}
      {status.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Erreur:</span> {status.error}
          </p>
        </div>
      )}

      {/* Messages d'information selon le statut */}
      {status.status === "generating" && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🎬 La génération de vidéo peut prendre jusqu&apos;à 2 minutes. Merci
            de patienter...
          </p>
        </div>
      )}

      {status.status === "downloading" && (
        <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
          <p className="text-sm text-cyan-800">
            📥 Téléchargement de la vidéo depuis les serveurs Google...
          </p>
        </div>
      )}
    </div>
  );
}
