"use client";

import React from "react";
import { Download, FileImage, Clock, Cpu } from "lucide-react";
import type { ImageResultResponse } from "../types/image-api";

interface ImageResultsProps {
  result: ImageResultResponse;
  className?: string;
}

export const ImageResults: React.FC<ImageResultsProps> = ({
  result,
  className = "",
}) => {
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

  if (!result.images || result.images.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {result.images.length > 1
            ? `${result.images.length} images générées`
            : "Image générée"}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            {result.metadata?.generation_time_seconds
              ? `${result.metadata.generation_time_seconds.toFixed(1)}s`
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Métadonnées */}
      {result.metadata && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-gray-500 mb-1">
                <Cpu className="w-3 h-3" />
                <span>Modèle</span>
              </div>
              <div className="font-medium text-gray-900">
                {result.metadata.model_name}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Tokens utilisés</div>
              <div className="font-medium text-gray-900">
                {result.metadata.input_tokens}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Taille totale</div>
              <div className="font-medium text-gray-900">
                {formatBytes(result.metadata.output_size_bytes)}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Horodatage</div>
              <div className="font-medium text-gray-900">
                {new Date(result.metadata.timestamp).toLocaleTimeString(
                  "fr-FR"
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grille d'images */}
      <div
        className={`grid gap-6 ${
          result.images.length === 1
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {result.images.map((image, index) => (
          <div
            key={index}
            className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              <img
                src={image.url}
                alt={image.description || `Image ${index + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />

              {/* Overlay au survol */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <button
                  onClick={() =>
                    handleDownload(
                      image.url,
                      `image_${index + 1}.${image.format.toLowerCase()}`
                    )
                  }
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white text-gray-900 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </div>

            {/* Informations */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <FileImage className="w-4 h-4" />
                  <span>{image.format}</span>
                  <span>•</span>
                  <span>{image.dimensions}</span>
                </div>
                <div className="text-gray-500">
                  {formatBytes(image.size_bytes)}
                </div>
              </div>

              {image.description && (
                <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                  {image.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
