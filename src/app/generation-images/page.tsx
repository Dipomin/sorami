"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Download,
  RefreshCw,
  Wand2,
  ArrowLeft,
  Images,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import type {
  ImageGenerationRequest,
  ImageResultResponse,
} from "@/types/image-api";

const stylePresets = [
  { id: "photorealistic" as const, label: "Réaliste", emoji: "📸" },
  { id: "artistic" as const, label: "Artistique", emoji: "🎨" },
  { id: "illustration" as const, label: "Illustration", emoji: "✨" },
  { id: "3d-render" as const, label: "3D Render", emoji: "🎭" },
];

const aspectRatios = [
  { id: "1:1", label: "Carré", icon: "▢" },
  { id: "16:9", label: "Paysage", icon: "▬" },
  { id: "9:16", label: "Portrait", icon: "▯" },
];

interface UserImage {
  id: string;
  filename: string;
  fileUrl: string;
  width: number;
  height: number;
  createdAt: string;
}

interface UserImageGeneration {
  id: string;
  prompt: string;
  createdAt: string;
  completedAt: string | null;
  images: UserImage[];
}

export default function GenerateImagesPage() {
  const { generateImage, isGenerating, currentStatus, error, reset } =
    useImageGeneration();

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<
    "photorealistic" | "artistic" | "illustration" | "3d-render"
  >("photorealistic");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [result, setResult] = useState<ImageResultResponse | null>(null);
  const [recentImages, setRecentImages] = useState<UserImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  // Charger les images récentes de l'utilisateur
  useEffect(() => {
    const fetchRecentImages = async () => {
      try {
        setLoadingGallery(true);
        setGalleryError(null);
        console.log("🔍 Chargement des images récentes...");
        const response = await fetch("/api/images/user");

        console.log("📡 Réponse API:", response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Erreur API:", errorData);
          setGalleryError(errorData.error || "Erreur de chargement");
          throw new Error("Erreur lors du chargement des images");
        }

        const data = await response.json();
        console.log("📦 Données reçues:", data);
        console.log("📊 Nombre de générations:", data.generations?.length || 0);

        // Extraire toutes les images de toutes les générations
        const allImages: UserImage[] = [];
        data.generations.forEach((gen: UserImageGeneration) => {
          console.log(
            `📸 Génération ${gen.id}:`,
            gen.images?.length || 0,
            "images"
          );
          // Ne prendre que les générations qui ont vraiment des images
          if (gen.images && gen.images.length > 0) {
            gen.images.forEach((img) => {
              // Vérifier que l'image a bien une URL
              if (img.fileUrl) {
                allImages.push(img);
              } else {
                console.warn(`⚠️ Image ${img.id} sans URL, ignorée`);
              }
            });
          }
        });

        console.log("🖼️ Total images extraites:", allImages.length);

        // Trier par date de création décroissante et prendre les 8 dernières
        const sortedImages = allImages
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 8);

        console.log("✅ Images à afficher:", sortedImages.length);
        console.log("🎯 Première image URL:", sortedImages[0]?.fileUrl);

        setRecentImages(sortedImages);
      } catch (error) {
        console.error("💥 Erreur chargement galerie:", error);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchRecentImages();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      // Mapper les ratios aux tailles de l'API
      const sizeMap: Record<string, "512x512" | "1024x1024" | "1792x1024"> = {
        "1:1": "1024x1024",
        "16:9": "1792x1024",
        "9:16": "1024x1024", // On utilise 1024x1024 pour 9:16 (portrait)
      };

      const data: ImageGenerationRequest = {
        prompt,
        style: selectedStyle,
        size: sizeMap[selectedRatio] || "1024x1024",
      };

      const generatedImage = await generateImage(data);
      setResult(generatedImage);

      // Recharger la galerie après une nouvelle génération réussie
      if (
        generatedImage.status === "COMPLETED" &&
        generatedImage.images &&
        generatedImage.images.length > 0
      ) {
        // Ajouter la nouvelle image en tête de la galerie
        const newImage = generatedImage.images[0];
        setRecentImages((prev) =>
          [
            {
              id: generatedImage.job_id, // Utiliser le job_id comme ID temporaire
              filename: newImage.file_path.split("/").pop() || "image.png",
              fileUrl: newImage.url,
              width: 1024, // valeur par défaut
              height: 1024,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, 8)
        ); // Garder max 8 images
      }
    } catch (err) {
      console.error("Erreur génération:", err);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
    setPrompt("");
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                Génération d'Images
              </h1>
              <p className="text-dark-300 mt-1">
                Créez des visuels époustouflants avec l'IA
              </p>
            </div>
          </div>
          {result && (
            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Nouvelle image
            </Button>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire de génération */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Prompt */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Décrivez votre image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Un chef d'entreprise africain dans un bureau moderne avec vue sur la ville..."
                className="w-full h-32 px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={isGenerating}
              />
              <p className="text-dark-400 text-sm mt-2">
                Soyez précis pour obtenir les meilleurs résultats
              </p>
            </div>

            {/* Style Preset */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Style artistique
              </label>
              <div className="grid grid-cols-3 gap-3">
                {stylePresets.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    disabled={isGenerating}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      selectedStyle === style.id
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                    )}
                  >
                    <div className="text-3xl mb-2">{style.emoji}</div>
                    <p className="text-sm font-medium text-white">
                      {style.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio.id)}
                    disabled={isGenerating}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      selectedRatio === ratio.id
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                    )}
                  >
                    <div className="text-2xl mb-2">{ratio.icon}</div>
                    <p className="text-sm font-medium text-white">
                      {ratio.label}
                    </p>
                    <p className="text-xs text-dark-400">{ratio.id}</p>
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
                  Générer l'image
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
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
                        <div className="absolute inset-0 bg-gradient-violet rounded-full opacity-20 animate-ping" />
                        <div className="relative w-full h-full bg-gradient-violet rounded-full flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-white animate-pulse" />
                        </div>
                      </div>
                      <p className="text-white font-medium mb-2">
                        Création en cours...
                      </p>
                      <p className="text-dark-400 text-sm">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-violet-300"
                        >
                          {currentStatus?.message || "Initialisation"}
                        </motion.p>
                      </p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full"
                    >
                      <div className="relative rounded-xl overflow-hidden group">
                        <img
                          src={
                            result.images?.[0]?.url || "/placeholder-image.png"
                          }
                          alt={
                            result.images?.[0]?.description || "Image générée"
                          }
                          className="w-full h-auto rounded-xl shadow-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <p className="text-white text-sm line-clamp-2">
                            {prompt}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-dark-800/30 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-dark-400">Style:</span>
                          <span className="text-white font-medium">
                            {selectedStyle}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-dark-400">Format:</span>
                          <span className="text-white font-medium">
                            {selectedRatio}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-dark-400"
                    >
                      <Images className="w-20 h-20 mx-auto mb-4 opacity-20" />
                      <p>Votre image apparaîtra ici</p>
                      <p className="text-sm mt-2">
                        Commencez par décrire votre idée
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
            Vos images récentes
            {!loadingGallery && (
              <span className="ml-3 text-sm font-normal text-dark-400">
                ({recentImages.length} image
                {recentImages.length !== 1 ? "s" : ""})
              </span>
            )}
          </h2>

          {loadingGallery ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl overflow-hidden animate-pulse"
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
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </div>
          ) : recentImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-square bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all cursor-pointer group relative"
                >
                  <img
                    src={image.fileUrl}
                    alt={`Image générée ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-dark-900/30 backdrop-blur-sm border border-dark-800/50 rounded-xl">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400">
                Aucune image générée pour le moment
              </p>
              <p className="text-dark-500 text-sm mt-2">
                Vos créations apparaîtront ici
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
