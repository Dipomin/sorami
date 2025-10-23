/**
 * Composant UserVideosGallery
 * Affiche l'historique des vidéos générées par l'utilisateur connecté
 * Permet de lire et télécharger les vidéos depuis AWS S3
 */

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Film,
  Download,
  Calendar,
  Clock,
  Maximize,
  ExternalLink,
  Loader2,
  AlertCircle,
  Server,
} from "lucide-react";

interface VideoFile {
  id: string;
  file_url?: string;
  file_path?: string;
  file_size?: number;
  duration_seconds?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  created_at: string;
}

interface UserVideo {
  id: string;
  prompt: string;
  duration: number;
  status: string;
  created_at: string;
  completed_at?: string;
  video_file?: VideoFile;
}

export default function UserVideosGallery() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchUserVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        const response = await fetch("/api/videos/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des vidéos");
        }

        const data = await response.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error("Erreur chargement vidéos:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchUserVideos();
  }, [isLoaded, isSignedIn, getToken]);

  const handleDownload = async (video: UserVideo) => {
    try {
      if (video.video_file?.file_url) {
        // Téléchargement direct depuis S3
        console.log("📥 Téléchargement depuis S3:", video.video_file.file_url);

        const link = document.createElement("a");
        link.href = video.video_file.file_url;
        link.download = `video-${video.id}.mp4`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback: téléchargement via API
        console.log("📥 Téléchargement via API pour video:", video.id);

        const token = await getToken();
        const response = await fetch(`/api/videos/${video.id}/download`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du téléchargement");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `video-${video.id}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Erreur téléchargement:", err);
      alert("Erreur lors du téléchargement de la vidéo");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    return `${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">
            Chargement de vos vidéos...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="flex items-start text-red-600">
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Erreur de chargement</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Film className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune vidéo générée
        </h3>
        <p className="text-gray-600 text-sm">
          Vos vidéos générées apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Film className="w-6 h-6 mr-2 text-blue-600" />
        Mes vidéos générées
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({videos.length})
        </span>
      </h2>

      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="flex flex-col md:flex-row">
              {/* Lecteur vidéo */}
              <div className="relative w-full md:w-80 aspect-video bg-black flex-shrink-0">
                {video.video_file?.file_url ? (
                  <div className="relative w-full h-full">
                    <video
                      src={video.video_file.file_url}
                      controls
                      playsInline
                      preload="metadata"
                      controlsList="nodownload"
                      className="w-full h-full object-contain"
                    >
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>

                    {/* Badge S3 animé */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-green-500 bg-opacity-90 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-lg">
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Lecture depuis AWS S3
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Film className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Informations et actions */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  {/* Prompt */}
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {video.prompt}
                  </p>

                  {/* Métadonnées */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(video.created_at)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Durée:{" "}
                      {formatDuration(video.video_file?.duration_seconds)}
                    </div>
                    {video.video_file?.dimensions && (
                      <div className="flex items-center">
                        <Maximize className="w-3 h-3 mr-1" />
                        {video.video_file.dimensions.width}x
                        {video.video_file.dimensions.height}
                      </div>
                    )}
                    {video.video_file?.file_size && (
                      <div className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {formatFileSize(video.video_file.file_size)}
                      </div>
                    )}
                  </div>

                  {/* Badge S3 */}
                  {video.video_file?.file_url && (
                    <div className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mb-3">
                      <Server className="w-3 h-3 mr-1" />
                      Hébergé sur AWS S3
                    </div>
                  )}

                  {/* Statut */}
                  <div className="inline-flex items-center">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        video.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : video.status === "processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {video.status === "completed"
                        ? "✓ Terminé"
                        : video.status === "processing"
                        ? "⏳ En cours"
                        : video.status}
                    </span>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDownload(video)}
                    disabled={!video.video_file?.file_url}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </button>

                  {video.video_file?.file_url && (
                    <button
                      onClick={() =>
                        video.video_file?.file_url &&
                        window.open(video.video_file.file_url, "_blank")
                      }
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
