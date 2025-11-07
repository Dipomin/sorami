/**
 * Composant pour afficher les images de blog depuis le bucket S3 public
 * Les images sont stockées dans sorami-blog (public), pas besoin d'URLs présignées
 */

"use client";

import React, { useState } from "react";

interface BlogImageProps {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Composant principal pour afficher les images de blog
 * Utilise directement les URLs publiques S3
 */
export function BlogImage({
  src,
  alt,
  fallback,
  className = "",
}: BlogImageProps) {
  const [imageError, setImageError] = useState(false);

  // Afficher le fallback si pas d'URL ou erreur de chargement
  if (!src || imageError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-600/20 ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-sm text-slate-400">Image de blog</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        console.warn("Failed to load blog image:", src);
        setImageError(true);
      }}
    />
  );
}

/**
 * Composant spécialisé pour les images de couverture de blog
 */
interface BlogCoverImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export function BlogCoverImage({
  src,
  alt,
  className = "",
}: BlogCoverImageProps) {
  return (
    <BlogImage
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      fallback={
        <div
          className={`bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center ${className}`}
        >
          <div className="text-white text-center p-4">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-sm opacity-80">Image de couverture</div>
          </div>
        </div>
      }
    />
  );
}
