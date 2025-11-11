"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Upload,
  X,
  Loader2,
  Download,
  Play,
  Wand2,
  Info,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

// Types
interface ReferenceImage {
  source: "url" | "path" | "base64";
  data: string;
  type: "asset" | "style" | "subject";
}

interface VideoGenerationRequest {
  prompt: string;
  reference_images?: ReferenceImage[];
  aspect_ratio?: "16:9" | "16:10";
  duration_seconds?: 5 | 6 | 7 | 8;
  number_of_videos?: 1 | 2 | 3 | 4;
  person_generation?: "ALLOW_ALL" | "DENY_ALL";
  save_to_cloud?: boolean;
  generate_image_first?: boolean;
  image_generation_prompt?: string;
}

interface GeneratedVideo {
  filename: string;
  url: string;
  s3_url: string;
  file_size: number;
  duration_seconds: number;
  aspect_ratio: string;
  dimensions: { width: number; height: number };
}

interface UserCustomVideo {
  id: string;
  filename: string;
  fileUrl: string;
  width: number;
  height: number;
  durationSeconds: number;
  createdAt: string;
  format: string;
  generation?: {
    prompt: string;
    aspectRatio: string;
    createdAt: string;
  };
}

interface UserCustomVideoGeneration {
  id: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
  completedAt: string | null;
  videos: UserCustomVideo[];
}

interface JobStatus {
  job_id: string;
  status:
    | "pending"
    | "processing"
    | "generating"
    | "downloading"
    | "completed"
    | "failed";
  message: string;
  progress: number;
  videos: GeneratedVideo[];
}

// Utilitaire : Conversion File vers base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Fonction de polling du statut via API Next.js (évite les problèmes de token backend)
async function pollJobStatus(
  jobId: string,
  onProgress: (progress: number, message: string) => void,
  maxWaitMinutes: number = 5
): Promise<GeneratedVideo[]> {
  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;

  while (true) {
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error(`Timeout après ${maxWaitMinutes} minutes`);
    }

    // ✅ Appeler l'API Next.js locale au lieu du backend
    // Cela évite les problèmes de token JWT avec le backend
    const response = await fetch(`/api/video-generations/${jobId}/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Si 404, la génération n'existe pas encore dans la DB (webhook pas reçu)
    if (response.status === 404) {
      onProgress(5, "En attente du webhook...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();

    // Mettre à jour le statut UI
    onProgress(data.progress, data.message);

    if (data.status === "COMPLETED" && data.videoFile) {
      // Transformer au format attendu
      return [
        {
          filename: data.videoFile.filename,
          url: data.videoFile.url || "",
          s3_url: data.videoFile.url || "",
          file_size: data.videoFile.fileSize,
          duration_seconds: data.videoFile.duration,
          aspect_ratio: data.videoFile.metadata?.aspectRatio || "16:9",
          dimensions: {
            width: data.videoFile.width,
            height: data.videoFile.height,
          },
        },
      ];
    } else if (data.status === "FAILED") {
      throw new Error(data.error || "Génération échouée");
    }

    // Attendre avant le prochain check
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

export default function CustomVideosPage() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "16:10">("16:9");
  const [duration, setDuration] = useState<5 | 6 | 7 | 8>(8);

  // States pour la galerie
  const [recentVideos, setRecentVideos] = useState<UserCustomVideo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // State pour la modal
  const [selectedVideo, setSelectedVideo] = useState<UserCustomVideo | null>(
    null
  );

  // Charger les vidéos personnalisées récentes de l'utilisateur
  const fetchRecentVideos = useCallback(async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoadingGallery(true);
      } else {
        setLoadingMore(true);
      }
      setGalleryError(null);

      console.log(`🔍 Chargement des vidéos personnalisées page ${pageNum}...`);
      const response = await fetch(
        `/api/videos/user-custom?page=${pageNum}&limit=12`
      );

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
      const allVideos: UserCustomVideo[] = [];
      data.generations.forEach((gen: UserCustomVideoGeneration) => {
        if (gen.videos && gen.videos.length > 0) {
          gen.videos.forEach((vid) => {
            if (vid.fileUrl && vid.fileUrl.trim() !== "") {
              allVideos.push({
                ...vid,
                generation: {
                  prompt: gen.prompt,
                  aspectRatio: gen.aspectRatio,
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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 3) {
        setError("Maximum 3 images autorisées");
        return;
      }

      setImageFiles(files);
      setError(null);

      // Créer les prévisualisations
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    },
    []
  );

  const removeImage = useCallback(
    (index: number) => {
      const newFiles = imageFiles.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);

      // Libérer l'URL de l'objet
      URL.revokeObjectURL(imagePreviews[index]);

      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
    },
    [imageFiles, imagePreviews]
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Veuillez entrer un prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus("Initialisation...");

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Non authentifié");
      }

      // ⏱️ Petit délai pour éviter les problèmes de clock skew (iat)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Conversion des images en base64
      const referenceImages: ReferenceImage[] = await Promise.all(
        imageFiles.map(async (file, index) => {
          const base64 = await fileToBase64(file);
          return {
            source: "base64" as const,
            data: base64,
            type: index === 0 ? ("subject" as const) : ("asset" as const),
          };
        })
      );

      const request: VideoGenerationRequest = {
        prompt,
        reference_images:
          referenceImages.length > 0 ? referenceImages : undefined,
        aspect_ratio: aspectRatio,
        duration_seconds: duration,
        number_of_videos: 1,
        save_to_cloud: true,
      };

      // ✅ Appeler l'API Next.js locale qui crée l'enregistrement DB
      const createResponse = await fetch("/api/videos/generate-custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            "Erreur lors de la création du job"
        );
      }

      const createData = await createResponse.json();
      const jobId = createData.job_id; // ✅ job_id maintenant créé dans Prisma

      console.log("✅ Job créé avec succès:", jobId);

      // Polling du statut via API Next.js (pas de token backend requis)
      const videos = await pollJobStatus(jobId, (progress, message) => {
        setProgress(progress);
        setStatus(message);
      });

      setGeneratedVideos(videos);
      setProgress(100);
      setStatus("Génération terminée !");

      // Rafraîchir la galerie après génération réussie
      console.log("🔄 Rafraîchissement de la galerie après génération");
      fetchRecentVideos(1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("❌ Erreur génération:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setImageFiles([]);
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImagePreviews([]);
    setGeneratedVideos([]);
    setError(null);
    setProgress(0);
    setStatus("");
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
      a.download = filename || "video-custom.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      setError("Erreur lors du téléchargement de la vidéo");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-glow">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-white">
                Vidéos Personnalisées
              </h1>
              <p className="text-dark-300 mt-1">
                Générez des vidéos avec vos images de référence
              </p>
            </div>
          </div>

          {/* Description détaillée */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="text-dark-200 space-y-2">
                <h3 className="font-semibold text-white mb-2">
                  Comment utiliser cette fonctionnalité ?
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>
                      <strong>Ajoutez vos images de référence</strong> (jusqu'à
                      3 images) - Ces images guideront le style et le contenu de
                      votre vidéo
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>
                      <strong>Décrivez votre vidéo</strong> - Soyez précis sur
                      les scènes, mouvements et l'ambiance souhaitée
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>
                      <strong>Choisissez les paramètres</strong> - Format (16:9
                      ou 16:10) et durée (5 à 8 secondes)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>
                      <strong>Lancez la génération</strong> - La création peut
                      prendre quelques minutes
                    </span>
                  </li>
                </ul>
                <p className="text-xs text-dark-400 mt-4">
                  💡 <strong>Conseil :</strong> Pour de meilleurs résultats,
                  utilisez des images haute qualité et un prompt détaillé.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Upload d'images */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="flex items-center gap-2 text-white font-semibold mb-3">
                <ImageIcon className="w-5 h-5" />
                Images de référence (max 3)
              </label>

              <div className="space-y-4">
                {/* Zone de drop */}
                <label
                  className={cn(
                    "block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    loading
                      ? "border-dark-700 bg-dark-800/30 cursor-not-allowed"
                      : "border-dark-600 hover:border-primary-500 bg-dark-800/50 hover:bg-dark-800"
                  )}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">
                    Cliquez pour ajouter des images
                  </p>
                  <p className="text-dark-400 text-sm">
                    JPG, PNG ou WEBP (max 3 images)
                  </p>
                </label>

                {/* Prévisualisations */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group rounded-xl overflow-hidden aspect-square"
                      >
                        <img
                          src={preview}
                          alt={`Référence ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeImage(index)}
                            disabled={loading}
                            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded-md text-xs text-white">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Prompt */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Description de la vidéo *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Une vidéo dynamique montrant l'évolution d'une ville moderne, avec des transitions fluides entre le jour et la nuit, des mouvements de caméra cinématiques..."
                className="w-full h-32 px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={loading}
              />
              <p className="text-dark-400 text-sm mt-2">
                Décrivez précisément les scènes, mouvements et ambiance
              </p>
            </div>

            {/* Format */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Format vidéo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAspectRatio("16:9")}
                  disabled={loading}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    aspectRatio === "16:9"
                      ? "border-primary-500 bg-primary-500/10"
                      : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                  )}
                >
                  <div className="text-white font-medium mb-1">16:9</div>
                  <div className="text-dark-400 text-sm">Standard</div>
                </button>
                <button
                  onClick={() => setAspectRatio("16:10")}
                  disabled={loading}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    aspectRatio === "16:10"
                      ? "border-primary-500 bg-primary-500/10"
                      : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                  )}
                >
                  <div className="text-white font-medium mb-1">16:10</div>
                  <div className="text-dark-400 text-sm">Large</div>
                </button>
              </div>
            </div>

            {/* Durée */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Durée de la vidéo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 6, 7, 8].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d as 5 | 6 | 7 | 8)}
                    disabled={loading}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-center",
                      duration === d
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                    )}
                  >
                    <div className="text-white font-bold">{d}s</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton de génération */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              variant="glow"
              size="lg"
              className="w-full"
            >
              {loading ? (
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
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6 min-h-[600px]">
              <h3 className="text-xl font-semibold text-white mb-4">
                Résultat
              </h3>

              {/* État initial */}
              {!loading && generatedVideos.length === 0 && !error && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-dark-400">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Aucune vidéo générée</p>
                    <p className="text-sm">
                      Configurez vos paramètres et lancez la génération
                    </p>
                  </div>
                </div>
              )}

              {/* Progression */}
              {loading && (
                <div className="space-y-4">
                  <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {status}
                      </span>
                      <span className="text-sm font-medium text-primary-400">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                  </div>
                </div>
              )}

              {/* Erreur */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-medium mb-1">Erreur</p>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vidéos générées */}
              {generatedVideos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Génération terminée avec succès !
                    </span>
                  </div>

                  {generatedVideos.map((video, index) => (
                    <div
                      key={index}
                      className="border border-dark-700 rounded-xl overflow-hidden bg-dark-800/30"
                    >
                      {/* Lecteur vidéo */}
                      <video
                        src={video.url}
                        controls
                        className="w-full bg-black"
                      />

                      {/* Informations */}
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-dark-400">Fichier:</span>
                            <p className="text-white font-medium truncate">
                              {video.filename}
                            </p>
                          </div>
                          <div>
                            <span className="text-dark-400">Taille:</span>
                            <p className="text-white font-medium">
                              {(video.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div>
                            <span className="text-dark-400">Durée:</span>
                            <p className="text-white font-medium">
                              {video.duration_seconds}s
                            </p>
                          </div>
                          <div>
                            <span className="text-dark-400">Dimensions:</span>
                            <p className="text-white font-medium">
                              {video.dimensions.width}x{video.dimensions.height}
                            </p>
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleDownload(video.url, video.filename)
                            }
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Nouvelle
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Galerie des vidéos récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-display font-bold text-white mb-6">
            Vos vidéos personnalisées récentes
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
                    onClick={() => setSelectedVideo(video)}
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
                        {video.generation && (
                          <p className="text-dark-300 text-[10px] mt-1 line-clamp-1">
                            {video.generation.prompt.substring(0, 40)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(video.fileUrl || "", video.filename);
                        }}
                        className="p-2 bg-dark-900/90 backdrop-blur-sm rounded-lg hover:bg-dark-800/90 transition-colors"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Lazy loading indicator & observer target */}
              {hasMore && (
                <div
                  ref={observerTarget}
                  className="flex justify-center items-center py-8"
                >
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-dark-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Chargement...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-dark-900/30 backdrop-blur-sm border border-dark-800/50 rounded-xl">
              <Video className="w-16 h-16 mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400">
                Aucune vidéo personnalisée générée pour le moment
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
                  Détails de la vidéo personnalisée
                </h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-dark-800/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-dark-400 hover:text-white" />
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-6">
                {/* Lecteur vidéo */}
                <div className="aspect-video bg-dark-950/50 rounded-xl overflow-hidden border border-dark-800/50">
                  <video
                    src={selectedVideo.fileUrl || ""}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Métadonnées */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Colonne gauche - Prompt */}
                  {selectedVideo.generation?.prompt && (
                    <div className="md:col-span-2 bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-dark-400 mb-2">
                        Prompt utilisé
                      </h4>
                      <p className="text-white text-base leading-relaxed">
                        {selectedVideo.generation.prompt}
                      </p>
                    </div>
                  )}

                  {/* Dimensions */}
                  <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">
                      Dimensions
                    </h4>
                    <p className="text-white text-xl font-semibold">
                      {selectedVideo.width} × {selectedVideo.height}
                    </p>
                  </div>

                  {/* Durée */}
                  <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">
                      Durée
                    </h4>
                    <p className="text-white text-xl font-semibold">
                      {selectedVideo.durationSeconds} secondes
                    </p>
                  </div>

                  {/* Format */}
                  <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">
                      Format
                    </h4>
                    <p className="text-white text-xl font-semibold uppercase">
                      {selectedVideo.format}
                    </p>
                  </div>

                  {/* Aspect Ratio */}
                  {selectedVideo.generation?.aspectRatio && (
                    <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-dark-400 mb-2">
                        Ratio d'aspect
                      </h4>
                      <p className="text-white text-xl font-semibold">
                        {selectedVideo.generation.aspectRatio}
                      </p>
                    </div>
                  )}

                  {/* Date de création */}
                  <div className="bg-dark-950/50 backdrop-blur-sm border border-dark-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">
                      Créée le
                    </h4>
                    <p className="text-white text-xl font-semibold">
                      {new Date(selectedVideo.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Bouton de téléchargement */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() =>
                      handleDownload(
                        selectedVideo.fileUrl || "",
                        selectedVideo.filename
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
