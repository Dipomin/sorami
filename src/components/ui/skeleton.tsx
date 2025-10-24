"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Composant Skeleton pour loading states
 * Utilise une animation de pulsation pour indiquer le chargement
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn("bg-dark-800/50 rounded-lg", className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/**
 * Skeleton pour une carte de blog
 */
export function BlogCardSkeleton() {
  return (
    <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" /> {/* Image */}
      <Skeleton className="h-6 w-3/4" /> {/* Title */}
      <Skeleton className="h-4 w-full" /> {/* Line 1 */}
      <Skeleton className="h-4 w-5/6" /> {/* Line 2 */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-lg" /> {/* Tag 1 */}
        <Skeleton className="h-6 w-20 rounded-lg" /> {/* Tag 2 */}
      </div>
      <div className="flex items-center gap-4 pt-4 border-t border-dark-800/50">
        <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" /> {/* Author */}
          <Skeleton className="h-3 w-16" /> {/* Date */}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour une liste de blogs (grille)
 */
export function BlogListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour une carte de statistiques
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-6 space-y-4">
      <Skeleton className="h-12 w-12 rounded-xl" /> {/* Icon */}
      <Skeleton className="h-8 w-20" /> {/* Value */}
      <Skeleton className="h-4 w-32" /> {/* Label */}
    </div>
  );
}

/**
 * Skeleton pour le header d'un article
 */
export function ArticleHeaderSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" /> {/* Title */}
      <Skeleton className="h-5 w-1/2" /> {/* Subtitle */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" /> {/* Author */}
          <Skeleton className="h-3 w-24" /> {/* Date */}
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" /> {/* Cover image */}
    </div>
  );
}

/**
 * Skeleton pour le contenu d'un article
 */
export function ArticleContentSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-11/12" : "w-5/6"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton pour une table
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-3 border-b border-dark-800/50">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour le profil utilisateur
 */
export function ProfileSkeleton() {
  return (
    <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Skeleton className="w-32 h-32 rounded-2xl" /> {/* Avatar */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <Skeleton className="h-8 w-48 mx-auto md:mx-0" /> {/* Name */}
          <Skeleton className="h-5 w-64 mx-auto md:mx-0" /> {/* Email */}
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Skeleton className="h-6 w-20 rounded-lg" /> {/* Badge 1 */}
            <Skeleton className="h-6 w-24 rounded-lg" /> {/* Badge 2 */}
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" /> {/* Button 1 */}
          <Skeleton className="h-10 w-32 rounded-xl" /> {/* Button 2 */}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour une grille de statistiques
 */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
