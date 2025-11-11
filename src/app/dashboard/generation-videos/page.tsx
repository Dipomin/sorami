"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Play,
  Loader2,
  Download,
  RefreshCw,
  Wand2,
  ArrowLeft,
  Film,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";

const durations = [
  { id: "5", label: "5 secondes", icon: "⚡" },
  { id: "10", label: "10 secondes", icon: "🎬" },
  { id: "15", label: "15 secondes", icon: "🎥" },
];

const qualities = [
  { id: "sd", label: "SD", desc: "480p" },
  { id: "hd", label: "HD", desc: "720p" },
  { id: "fhd", label: "Full HD", desc: "1080p" },
];

interface UserVideo {
  id: string;
  filename: string;
  fileUrl: string | null;
  width: number;
  height: number;
  durationSeconds: number;
  createdAt: string;
  format: string;
  generation?: {
    prompt: string;
    createdAt: string;
  };
}

interface UserVideoGeneration {
  id: string;
  prompt: string;
  createdAt: string;
  completedAt: string | null;
  videos: UserVideo[];
}

export default function GenerateVideosPage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("5");
  const [quality, setQuality] = useState("hd");
  const [recentVideos, setRecentVideos] = useState<UserVideo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    video: UserVideo;
    generation: UserVideoGeneration | null;
  } | null>(null);

  // ✅ Utiliser les states du hook au lieu de créer des locaux
  const { generateVideo, isGenerating, result, currentStatus, error, reset } =
    useVideoGeneration();

  // Charger les vidéos récentes de l'utilisateur
  const fetchRecentVideos = useCallback(async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoadingGallery(true);
      } else {
        setLoadingMore(true);
      }
      setGalleryError(null);

      console.log(`🔍 Chargement des vidéos page ${pageNum}...`);
      const response = await fetch(`/api/videos/user?page=${pageNum}&limit=12`);

      console.log("📡 Réponse API:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur API:", errorData);
        setGalleryError(errorData.error || "Erreur de chargement");
        throw new Error("Erreur lors du chargement des vidéos");
      }

      const data = await response.json();
      console.log("📦 Données reçues:", data);

      // Extraire toutes les vidéos de toutes les générations
      const allVideos: UserVideo[] = [];
      data.generations.forEach((gen: UserVideoGeneration) => {
        if (gen.videos && gen.videos.length > 0) {
          gen.videos.forEach((vid) => {
            if (vid.fileUrl && vid.fileUrl.trim() !== "") {
              allVideos.push({
                ...vid,
                generation: {
                  prompt: gen.prompt,
                  createdAt: gen.createdAt,
                },
              });
            } else {
              console.warn(`⚠️ Vidéo ${vid.id} sans URL valide, ignorée`);
            }
          });
        }
      });

      console.log("🎬 Total vidéos extraites:", allVideos.length);

      // Trier par date de création décroissante
      const sortedVideos = allVideos.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (pageNum === 1) {
        setRecentVideos(sortedVideos);
      } else {
        setRecentVideos((prev) => [...prev, ...sortedVideos]);
      }

      // Vérifier s'il y a plus de vidéos
      setHasMore(sortedVideos.length === 12);
    } catch (error) {
      console.error("💥 Erreur chargement galerie:", error);
    } finally {
      setLoadingGallery(false);
      setLoadingMore(false);
    }
  }, []);

  // Charger les vidéos au montage
  useEffect(() => {
    fetchRecentVideos(1);
  }, [fetchRecentVideos]);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !loadingGallery
        ) {
          console.log("📥 Chargement de la page suivante...");
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loadingGallery]);

  // Charger plus de vidéos quand page change
  useEffect(() => {
    if (page > 1) {
      fetchRecentVideos(page);
    }
  }, [page, fetchRecentVideos]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      await generateVideo({ prompt });

      // Rafraîchir la galerie après génération réussie
      if (result && result.status === "completed") {
        fetchRecentVideos(1);
      }
    } catch (err) {
      console.error("Erreur génération:", err);
    }
  };

  // Rafraîchir la galerie quand result change et est complété
  useEffect(() => {
    if (result && result.status === "completed") {
      console.log("🔄 Rafraîchissement de la galerie après génération");
      fetchRecentVideos(1);
    }
  }, [result, fetchRecentVideos]);

  const handleReset = () => {
    reset();
    setPrompt("");
  };

  const handleDownload = async (videoUrl: string, filename: string) => {
    try {
      const response = await fetch("/api/videos/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) throw new Error("Échec du téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "video.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                Génération de Vidéos
              </h1>
              <p className="text-dark-300 mt-1">
                Créez des vidéos captivantes avec l'IA
              </p>
            </div>
          </div>
          {result && (
            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Nouvelle vidéo
            </Button>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Prompt */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Décrivez votre vidéo
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Une vidéo inspirante montrant l'innovation technologique en Afrique avec des plans aériens de villes modernes..."
                className="w-full h-32 px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={isGenerating}
              />
              <p className="text-dark-400 text-sm mt-2">
                Décrivez les scènes, mouvements et ambiance souhaitée
              </p>
            </div>

            {/* Durée */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Durée de la vidéo
              </label>
              <div className="grid grid-cols-3 gap-3">
                {durations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    disabled={isGenerating}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      duration === d.id
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                    )}
                  >
                    <div className="text-3xl mb-2">{d.icon}</div>
                    <p className="text-sm font-medium text-white">{d.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Qualité */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Qualité vidéo
              </label>
              <div className="grid grid-cols-3 gap-3">
                {qualities.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    disabled={isGenerating}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      quality === q.id
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                    )}
                  >
                    <p className="text-lg font-bold text-white mb-1">
                      {q.label}
                    </p>
                    <p className="text-xs text-dark-400">{q.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton de génération */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              variant="glow"
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Générer la vidéo
                </>
              )}
            </Button>
          </motion.div>

          {/* Zone de résultats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Résultat</h3>
                {result && (
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center"
                    >
                      <div className="w-24 h-24 mx-auto mb-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full opacity-20 animate-ping" />
                        <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Film className="w-12 h-12 text-white animate-pulse" />
                        </div>
                      </div>
                      <p className="text-white font-medium mb-2">
                        {currentStatus?.message || "Création en cours..."}
                      </p>
                      <p className="text-dark-400 text-sm">
                        Traitement vidéo IA - {currentStatus?.progress || 0}%
                      </p>
                      {error && (
                        <p className="text-red-400 text-sm mt-2">
                          Erreur: {error}
                        </p>
                      )}
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full"
                    >
                      {result.videos &&
                      result.videos.length > 0 &&
                      result.videos[0]?.file_url ? (
                        <>
                          <div className="relative rounded-xl overflow-hidden bg-dark-950 aspect-video group">
                            <video
                              src={result.videos[0].file_url}
                              controls
                              className="w-full h-full"
                              onError={(e) => {
                                console.error(
                                  "❌ Erreur chargement vidéo:",
                                  result.videos[0].file_url
                                );
                              }}
                              onLoadedData={() => {
                                console.log(
                                  "✅ Vidéo chargée:",
                                  result.videos[0].file_url
                                );
                              }}
                            />
                          </div>
                          <div className="mt-4 p-4 bg-dark-800/30 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-dark-400">Durée:</span>
                              <span className="text-white font-medium">
                                {result.videos[0].duration_seconds || duration}s
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-dark-400">Résolution:</span>
                              <span className="text-white font-medium">
                                {result.videos[0].dimensions.width}x
                                {result.videos[0].dimensions.height}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-dark-400">Format:</span>
                              <span className="text-white font-medium">
                                {result.videos[0].format || "MP4"}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-red-400">
                          <p>Aucune vidéo disponible</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-dark-400"
                    >
                      <Play className="w-20 h-20 mx-auto mb-4 opacity-20" />
                      <p>Votre vidéo apparaîtra ici</p>
                      <p className="text-sm mt-2">
                        Décrivez la scène que vous imaginez
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Galerie récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Vos vidéos récentes
            {recentVideos.length > 0 && (
              <span className="text-dark-400 text-lg font-normal ml-2">
                ({recentVideos.length} vidéo
                {recentVideos.length !== 1 ? "s" : ""})
              </span>
            )}
          </h2>

          {loadingGallery ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-dark-600 animate-spin" />
                  </div>
                </div>
              ))}
            </div>
          ) : galleryError ? (
            <div className="text-center py-12 bg-red-900/20 backdrop-blur-sm border border-red-800/50 rounded-xl">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <p className="text-red-400 font-medium mb-2">
                Erreur de chargement
              </p>
              <p className="text-red-300/70 text-sm">{galleryError}</p>
              <Button
                onClick={() => fetchRecentVideos(1)}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          ) : recentVideos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() =>
                      setSelectedVideo({ video, generation: null })
                    }
                    className="aspect-video bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all cursor-pointer group relative"
                  >
                    <video
                      src={video.fileUrl || ""}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      onMouseEnter={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.pause();
                        target.currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="text-white text-xs">
                        <p className="font-medium">
                          {video.durationSeconds}s · {video.width}x
                          {video.height}
                        </p>
                        <p className="text-dark-300 text-[10px] mt-1">
                          {new Date(video.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(video.fileUrl || "", "_blank");
                        }}
                        className="p-2 bg-dark-900/90 backdrop-blur-sm rounded-lg hover:bg-dark-800/90 transition-colors"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Loader pour le lazy loading */}
              {hasMore && (
                <div
                  ref={observerTarget}
                  className="flex items-center justify-center py-8"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-dark-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Chargement...</span>
                    </div>
                  ) : (
                    <div className="text-dark-500 text-sm">
                      Faites défiler pour charger plus
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-dark-900/30 backdrop-blur-sm border border-dark-800/50 rounded-xl">
              <Video className="w-16 h-16 mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400">
                Aucune vidéo générée pour le moment
              </p>
              <p className="text-dark-500 text-sm mt-2">
                Vos créations apparaîtront ici
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal vidéo avec métadonnées */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-900/95 backdrop-blur-md border border-dark-800/50 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* En-tête */}
              <div className="sticky top-0 bg-dark-900/95 backdrop-blur-md border-b border-dark-800/50 p-6 flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold text-white">
                  Détails de la vidéo
                </h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-dark-800/50 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-dark-400 hover:text-white">
                    ×
                  </span>
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-6">
                {/* Lecteur vidéo */}
                <div className="aspect-video bg-dark-950/50 rounded-xl overflow-hidden border border-dark-800/50">
                  <video
                    src={selectedVideo.video.fileUrl || ""}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Métadonnées */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Colonne gauche - Prompt */}
                  {selectedVideo.video.generation?.prompt && (
                    <div className="md:col-span-2 bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-dark-400 mb-2">
                        Prompt utilisé
                      </h4>
                      <p className="text-white text-base leading-relaxed">
                        {selectedVideo.video.generation.prompt}
                      </p>
                    </div>
                  )}

                  {/* Dimensions */}
                  <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">
                      Dimensions
                    </h4>
                    <p className="text-white text-xl font-semibold">
                      {selectedVideo.video.width} × {selectedVideo.video.height}
                    </p>
                  </div>

                  {/* Durée */}
                  <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">
                      Durée
                    </h4>
                    <p className="text-white text-xl font-semibold">
                      {selectedVideo.video.durationSeconds} secondes
                    </p>
                  </div>

                  {/* Format */}
                  <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">
                      Format
                    </h4>
                    <p className="text-white text-xl font-semibold uppercase">
                      {selectedVideo.video.format}
                    </p>
                  </div>

                  {/* Date de création */}
                  <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">
                      Créée le
                    </h4>
                    <p className="text-white text-xl font-semibold">
                      {new Date(
                        selectedVideo.video.createdAt
                      ).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Bouton de téléchargement */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() =>
                      handleDownload(
                        selectedVideo.video.fileUrl || "",
                        selectedVideo.video.filename
                      )
                    }
                    className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-8 py-6 text-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger la vidéo
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
