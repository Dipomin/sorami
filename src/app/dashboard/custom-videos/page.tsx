"use client";

import React, { useState, useCallback } from "react";
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

      // Créer le job
      const createResponse = await fetch(
        "http://localhost:9006/api/secure/videos/generate-with-images",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Erreur lors de la création du job");
      }

      const createData = await createResponse.json();
      const jobId = createData.data.job_id;

      // Polling du statut via API Next.js (pas de token backend requis)
      const videos = await pollJobStatus(jobId, (progress, message) => {
        setProgress(progress);
        setStatus(message);
      });

      setGeneratedVideos(videos);
      setProgress(100);
      setStatus("Génération terminée !");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
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
                          <a
                            href={video.url}
                            download={video.filename}
                            className="flex-1"
                            target="_blank"
                          >
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Télécharger
                            </Button>
                          </a>
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
      </div>
    </DashboardLayout>
  );
}
