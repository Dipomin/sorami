/**
 * Composant pour afficher des images S3 avec URLs présignées
 */

import React, { useState } from "react";
import { usePresignedUrl, extractS3Key } from "@/hooks/usePresignedUrl";

interface S3ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  s3Key: string | null | undefined;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function S3Image({
  s3Key,
  fallback,
  loadingComponent,
  className = "",
  ...imgProps
}: S3ImageProps) {
  const key = extractS3Key(s3Key);
  const { presignedUrl, isLoading, error } = usePresignedUrl(key);
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div
        className={`flex items-center justify-center bg-gray-200 animate-pulse ${className}`}
      >
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    );
  }

  if (error || !presignedUrl || imageError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-gray-400 dark:text-gray-500 text-2xl mb-2">
            🖼️
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            {error ? "Erreur de chargement" : "Image non disponible"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      {...imgProps}
      src={presignedUrl}
      className={className}
      alt={imgProps.alt || "Image"}
      onError={(e) => {
        // Log détaillé pour le débogage
        console.warn("Failed to load S3 image:", {
          originalS3Key: s3Key,
          extractedKey: key,
          presignedUrl: presignedUrl?.substring(0, 100) + "...",
        });
        setImageError(true);
        if (imgProps.onError) {
          imgProps.onError(e);
        }
      }}
    />
  );
}

/**
 * Composant pour les images de couverture de blog avec style spécifique
 */
interface BlogCoverImageProps {
  s3Key: string | null | undefined;
  alt: string;
  className?: string;
}

export function BlogCoverImage({
  s3Key,
  alt,
  className = "",
}: BlogCoverImageProps) {
  return (
    <S3Image
      s3Key={s3Key}
      alt={alt}
      className={`object-cover ${className}`}
      fallback={
        <div
          className={`bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center ${className}`}
        >
          <div className="text-white text-center p-4">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm opacity-80">Image de couverture</div>
          </div>
        </div>
      }
      loadingComponent={
        <div
          className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        >
          <div className="text-gray-400 text-sm">Chargement image...</div>
        </div>
      }
    />
  );
}
