/**
 * Composant d'affichage des résultats de génération de vidéo
 * Affiche les vidéos générées avec leurs métadonnées
 */

"use client";

import { Download, Film, Clock, Maximize, Calendar } from "lucide-react";
import type { VideoResultResponse } from "@/types/video-api";

interface VideoResultsProps {
  result: VideoResultResponse;
}

export default function VideoResults({ result }: VideoResultsProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number): string => {
    return `${seconds}s`;
  };

  const handleDownload = async (video: (typeof result.videos)[0]) => {
    try {
      // Si l'API fournit une URL, on l'utilise directement
      if (video.file_url) {
        window.open(video.file_url, "_blank");
        return;
      }

      // Sinon, on télécharge via le chemin local (nécessite un endpoint proxy)
      const response = await fetch(
        `/api/videos/download?path=${encodeURIComponent(video.file_path)}`
      );
      if (!response.ok) throw new Error("Erreur lors du téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = video.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Impossible de télécharger la vidéo. Veuillez réessayer.");
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête des résultats */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-green-500 rounded-full">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Génération réussie !
            </h2>
            <p className="text-sm text-gray-600">{result.message}</p>
          </div>
        </div>

        {/* Métadonnées globales */}
        {result.generation_metadata && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-gray-600 text-xs mb-1">Modèle</p>
              <p className="font-semibold text-gray-900">
                {result.generation_metadata.model_name}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-gray-600 text-xs mb-1">Temps total</p>
              <p className="font-semibold text-gray-900">
                {result.generation_metadata.processing_time.toFixed(1)}s
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-gray-600 text-xs mb-1">Vidéos générées</p>
              <p className="font-semibold text-gray-900">
                {result.generation_metadata.num_videos_generated}/
                {result.generation_metadata.num_videos_requested}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-gray-600 text-xs mb-1">Temps de génération</p>
              <p className="font-semibold text-gray-900">
                {result.generation_metadata.generation_time.toFixed(1)}s
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Liste des vidéos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {result.videos.map((video, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
          >
            {/* Aperçu vidéo */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              {video.file_url ? (
                <video
                  src={video.file_url}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              ) : (
                <div className="text-center text-white">
                  <Film className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Vidéo disponible en téléchargement</p>
                </div>
              )}
            </div>

            {/* Informations vidéo */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {video.filename}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="flex items-center">
                      <Maximize className="w-3 h-3 mr-1" />
                      {video.dimensions.width}x{video.dimensions.height}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(video.duration_seconds)}
                    </span>
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {formatBytes(video.file_size)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métadonnées supplémentaires */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-gray-600">Ratio</p>
                  <p className="font-semibold text-gray-900">
                    {video.aspect_ratio}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-gray-600">Format</p>
                  <p className="font-semibold text-gray-900 uppercase">
                    {video.format}
                  </p>
                </div>
              </div>

              {/* Date de création */}
              <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                <Calendar className="w-3 h-3 mr-1" />
                Créée le{" "}
                {new Date(video.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Bouton de téléchargement */}
              <button
                onClick={() => handleDownload(video)}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger la vidéo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prompt utilisé */}
      {result.generation_metadata && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Film className="w-4 h-4 mr-2" />
            Description utilisée
          </h3>
          <p className="text-sm text-gray-700 italic">
            &quot;{result.generation_metadata.prompt_used}&quot;
          </p>

          {/* Configuration utilisée */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              Ratio: {result.generation_metadata.config_used.aspect_ratio}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              Durée: {result.generation_metadata.config_used.duration_seconds}s
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              Personnes:{" "}
              {result.generation_metadata.config_used.person_generation ===
              "ALLOW_ALL"
                ? "Autorisées"
                : "Interdites"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
