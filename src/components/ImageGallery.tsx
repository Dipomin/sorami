"use client";

import React from "react";
import { Download, FileImage, Clock, ImageIcon, Loader2 } from "lucide-react";
import { useUserImages } from "@/hooks/useUserImages";

export const ImageGallery: React.FC = () => {
  const { generations, loading, error } = useUserImages();

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-600 animate-spin" />
        <p className="text-gray-600">Chargement de vos images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">
          Erreur lors du chargement des images : {error}
        </p>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune image générée
        </h3>
        <p className="text-gray-600">Vos images générées apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Vos images générées
        </h2>
        <span className="text-sm text-gray-500">
          {generations.length} génération{generations.length > 1 ? "s" : ""}
        </span>
      </div>

      {generations.map((generation) => (
        <div
          key={generation.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* En-tête de la génération */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-900 font-medium line-clamp-2">
                  {generation.prompt}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(generation.completedAt || generation.createdAt)}
                  </span>
                  {generation.processingTime && (
                    <span>• {generation.processingTime.toFixed(1)}s</span>
                  )}
                  <span>• {generation.model}</span>
                  <span>
                    • {generation.images.length} image
                    {generation.images.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grille d'images */}
          <div className="p-6">
            <div
              className={`grid gap-4 ${
                generation.images.length === 1
                  ? "grid-cols-1"
                  : generation.images.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {generation.images.map((image) => (
                <div
                  key={image.id}
                  className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={image.fileUrl}
                      alt={generation.prompt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Overlay au survol */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() =>
                          handleDownload(image.fileUrl, image.filename)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white text-gray-900 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="p-3 bg-white">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-3 h-3" />
                        <span>{image.format}</span>
                        <span>•</span>
                        <span>
                          {image.width}×{image.height}
                        </span>
                      </div>
                      <span>{formatBytes(image.fileSize)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
