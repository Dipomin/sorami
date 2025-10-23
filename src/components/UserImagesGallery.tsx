"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Download,
  Calendar,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ImageFile {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  format: string;
  width: number;
  height: number;
  aspectRatio: string;
  createdAt: string;
}

interface ImageGeneration {
  id: string;
  prompt: string;
  status: string;
  numImages: number;
  createdAt: string;
  completedAt: string | null;
  images: ImageFile[];
  model: string;
  processingTime: number | null;
}

export const UserImagesGallery: React.FC = () => {
  const { getToken } = useAuth();
  const [generations, setGenerations] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("Authentification requise");
      }

      const response = await fetch("/api/images/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des générations");
      }

      const data = await response.json();
      setGenerations(data.generations || []);
    } catch (err) {
      console.error("Erreur:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
    } finally {
      setLoading(false);
    }
  };

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
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement de vos générations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-red-900 mb-1">
            Erreur de chargement
          </h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={loadGenerations}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune image générée
        </h3>
        <p className="text-gray-600">
          Vos générations d'images apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Mes Générations d'Images
        </h2>
        <div className="text-sm text-gray-500">
          {generations.length} génération{generations.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-6">
        {generations.map((generation) => (
          <div
            key={generation.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* En-tête de la génération */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-2 line-clamp-2">
                    {generation.prompt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(generation.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      <span>
                        {generation.images.length} image
                        {generation.images.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    {generation.processingTime && (
                      <div className="text-gray-500">
                        ⏱️ {generation.processingTime.toFixed(1)}s
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  {generation.status}
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
                    className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-purple-300 transition-all hover:shadow-lg"
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
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
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
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          {image.format} • {image.aspectRatio}
                        </span>
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
    </div>
  );
};
