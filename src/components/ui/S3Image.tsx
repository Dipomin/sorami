/**
 * Composant pour afficher des images S3 avec URLs présignées
 */

import React from "react";
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

  if (error || !presignedUrl) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
      >
        <div className="text-gray-400 text-sm">Image non disponible</div>
      </div>
    );
  }

  return (
    <img
      {...imgProps}
      src={presignedUrl}
      className={className}
      onError={(e) => {
        console.error("Error loading S3 image:", s3Key);
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
