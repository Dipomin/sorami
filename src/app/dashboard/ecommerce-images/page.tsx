"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Download,
  Wand2,
  Info,
  CheckCircle,
  AlertCircle,
  Package,
  User,
  Mountain,
  Watch,
  History,
  Eye,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import ImageModal from "@/components/dashboard/ImageModal";

// Types
type ImageSource = "url" | "path" | "base64";
type ImageType = "product" | "model" | "background" | "accessory";
type QualityLevel = "thumbnail" | "standard" | "high" | "ultra";
type JobStatus = "idle" | "pending" | "processing" | "completed" | "failed";

interface ReferenceImage {
  image_source: ImageSource;
  image_data: string;
  image_type: ImageType;
  description?: string;
}

interface EcommerceImageRequest {
  prompt: string;
  reference_images: ReferenceImage[];
  quality_level: QualityLevel;
  num_variations: number;
  output_format: "png" | "jpeg";
  additional_requirements?: string[];
  save_to_cloud: boolean;
}

interface GeneratedImage {
  id: string;
  url: string;
  s3Key: string;
  filename: string;
  width: number;
  height: number;
  format: string;
  aspectRatio: string;
  metadata?: any;
}

interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
  message: string;
  images?: GeneratedImage[];
  generation_metadata?: any;
  error?: string;
}

interface ImageGeneration {
  id: string;
  prompt: string;
  status: string;
  images: GeneratedImage[];
  generationMetadata: any;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const qualityOptions = [
  { value: "thumbnail", label: "Thumbnail", desc: "500x500" },
  { value: "standard", label: "Standard", desc: "1000x1000" },
  { value: "high", label: "High", desc: "2000x2000" },
  { value: "ultra", label: "Ultra", desc: "4000x4000" },
];

const imageTypeConfig = {
  product: { icon: Package, label: "Produit", emoji: "📦" },
  model: { icon: User, label: "Modèle", emoji: "👤" },
  background: { icon: Mountain, label: "Arrière-plan", emoji: "🏞️" },
  accessory: { icon: Watch, label: "Accessoire", emoji: "💍" },
};

export default function EcommerceImagesPage() {
  const { getToken } = useAuth();

  // État
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>("standard");
  const [numVariations, setNumVariations] = useState(1);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");

  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // État pour l'historique
  const [previousGenerations, setPreviousGenerations] = useState<
    ImageGeneration[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // État pour le modal
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null);
  const [selectedCreatedAt, setSelectedCreatedAt] = useState<string>("");

  // Charger l'historique au montage du composant
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch("/api/image-generations");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique");
      }

      const data = await response.json();
      setPreviousGenerations(data.generations || []);
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openImageModal = (
    image: GeneratedImage,
    prompt: string,
    metadata: any,
    createdAt: string
  ) => {
    setSelectedImage(image);
    setSelectedPrompt(prompt);
    setSelectedMetadata(metadata);
    setSelectedCreatedAt(createdAt);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedPrompt("");
    setSelectedMetadata(null);
    setSelectedCreatedAt("");
  };

  // Gestion des images de référence
  const handleFileUpload = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      imageType: ImageType
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validation de la taille
      if (file.size > 10 * 1024 * 1024) {
        setError("Fichier trop grand. Maximum: 10 MB");
        return;
      }

      // Validation du format
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Format non supporté. Utilisez JPEG, PNG ou WEBP");
        return;
      }

      // Conversion en base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;

        setReferenceImages((prev) => [
          ...prev,
          {
            image_source: "base64",
            image_data: base64String,
            image_type: imageType,
            description: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleUrlInput = useCallback((url: string, imageType: ImageType) => {
    if (!url.trim()) return;

    try {
      const urlObj = new URL(url);
      setReferenceImages((prev) => [
        ...prev,
        {
          image_source: "url",
          image_data: url.trim(),
          image_type: imageType,
          description: `Image from ${urlObj.hostname}`,
        },
      ]);
    } catch {
      setError("URL invalide");
    }
  }, []);

  const removeReferenceImage = useCallback((index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Polling du statut via base de données Prisma (évite les problèmes de token backend)
  const pollJobStatus = useCallback(async (jobId: string) => {
    const maxAttempts = 120; // 4 minutes max (120 * 2s)
    let attempt = 0;

    const poll = async () => {
      try {
        // ✅ Appeler l'API Next.js locale au lieu du backend
        // Cela évite les problèmes de token JWT avec le backend
        const response = await fetch(`/api/image-generations/${jobId}/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Si 404, la génération n'existe pas encore dans la DB
          if (response.status === 404 && attempt < maxAttempts) {
            attempt++;
            setTimeout(poll, 2000);
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        setStatus(data.status);
        setProgress(data.progress || 0);
        setMessage(data.message || "Génération en cours...");

        if (data.status === "COMPLETED") {
          // Récupérer les images depuis la DB
          setGeneratedImages(data.images || []);
          setIsLoading(false);
        } else if (data.status === "FAILED") {
          setError(data.error || "Génération échouée");
          setIsLoading(false);
        } else if (attempt < maxAttempts) {
          attempt++;
          setTimeout(poll, 2000);
        } else {
          setError("Timeout: La génération prend trop de temps");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Erreur polling:", err);
        // En cas d'erreur, réessayer si on n'a pas dépassé le max
        if (attempt < maxAttempts) {
          attempt++;
          setTimeout(poll, 2000);
        } else {
          setError(`Erreur polling: ${err}`);
          setIsLoading(false);
        }
      }
    };

    poll();
  }, []);

  // Génération
  const generateImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setGeneratedImages([]);
      setStatus("pending");
      setProgress(0);

      // Validation
      if (!prompt.trim()) {
        throw new Error("Le prompt est requis");
      }

      if (referenceImages.length === 0) {
        throw new Error("Au moins une image de référence est requise");
      }

      if (referenceImages.length > 10) {
        throw new Error("Maximum 10 images de référence");
      }

      // Récupération du token
      const token = await getToken();
      if (!token) {
        throw new Error("Token Clerk non disponible. Connectez-vous.");
      }

      // ⏱️ Petit délai pour éviter les problèmes de clock skew (iat)
      // Le token JWT peut avoir un 'iat' (issued at) légèrement dans le futur
      // à cause de différences d'horloge entre systèmes
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Préparation de la requête
      const request: EcommerceImageRequest = {
        prompt,
        reference_images: referenceImages,
        quality_level: qualityLevel,
        num_variations: numVariations,
        output_format: outputFormat,
        save_to_cloud: true,
      };

      // Appel API
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:9006"
        }/api/secure/images/generate-ecommerce`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const newJobId = result.job_id || result.data?.job_id;
      setJobId(newJobId);

      // Démarrage du polling
      pollJobStatus(newJobId);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
      setIsLoading(false);
    }
  }, [
    prompt,
    referenceImages,
    qualityLevel,
    numVariations,
    outputFormat,
    getToken,
    pollJobStatus,
  ]);

  const handleReset = () => {
    setPrompt("");
    setReferenceImages([]);
    setGeneratedImages([]);
    setError(null);
    setProgress(0);
    setStatus("idle");
    setMessage("");
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-glow">
              <ImageIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-white">
                Images E-commerce
              </h1>
              <p className="text-dark-300 mt-1">
                Créez des photos produits professionnelles avec l'IA
              </p>
            </div>
          </div>

          {/* Description détaillée */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="text-dark-200 space-y-2">
                <h3 className="font-semibold text-white mb-2">
                  Comment créer des images e-commerce de haute qualité ?
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>
                      <strong>Ajoutez vos images de référence</strong> (jusqu'à
                      10) - Produit, modèle, arrière-plan, accessoires
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>
                      <strong>Décrivez l'image finale</strong> - Précisez le
                      style, l'éclairage, la composition et l'ambiance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>
                      <strong>Choisissez la qualité</strong> - De Thumbnail
                      (500px) à Ultra (4000px) selon vos besoins
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>
                      <strong>Générez plusieurs variations</strong> - Obtenez
                      jusqu'à 4 variations différentes en une seule génération
                    </span>
                  </li>
                </ul>
                <p className="text-xs text-dark-400 mt-4">
                  💡 <strong>Conseil :</strong> Combinez différents types
                  d'images (produit + modèle + arrière-plan) pour des résultats
                  exceptionnels. Utilisez des prompts en anglais pour de
                  meilleurs résultats.
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
            {/* Prompt */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Description de l'image *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Create a professional e-commerce fashion photo showing a woman wearing a blue dress in an outdoor setting with natural lighting, studio quality..."
                className="w-full h-32 px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-dark-400 text-sm">
                  Décrivez précisément le style, l'éclairage et la composition
                </p>
                <p className="text-dark-500 text-xs">{prompt.length}/2000</p>
              </div>
            </div>

            {/* Upload d'images */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="flex items-center gap-2 text-white font-semibold mb-3">
                <ImageIcon className="w-5 h-5" />
                Images de référence ({referenceImages.length}/10) *
              </label>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(imageTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={type}
                      className="border-2 border-dashed border-dark-700 rounded-xl p-3 hover:border-primary-500 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary-400" />
                        <span className="text-sm font-medium text-white">
                          {config.label}
                        </span>
                      </div>
                      <label className="block">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) =>
                            handleFileUpload(e, type as ImageType)
                          }
                          className="hidden"
                          disabled={isLoading}
                        />
                        <div className="text-xs text-dark-400 bg-dark-800/50 rounded p-2 text-center cursor-pointer hover:bg-dark-800">
                          <Upload className="w-4 h-4 mx-auto mb-1" />
                          Upload
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Liste des images ajoutées */}
              {referenceImages.length > 0 && (
                <div className="bg-dark-800/30 rounded-xl p-3 space-y-2">
                  <h4 className="text-sm font-medium text-white mb-2">
                    Images ajoutées:
                  </h4>
                  {referenceImages.map((img, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-dark-800/50 p-2 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">
                          {imageTypeConfig[img.image_type].emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white capitalize">
                            {imageTypeConfig[img.image_type].label}
                          </p>
                          <p className="text-xs text-dark-400 truncate">
                            {img.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeReferenceImage(index)}
                        disabled={isLoading}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Configuration */}
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3">
                Configuration
              </label>

              <div className="space-y-4">
                {/* Qualité */}
                <div>
                  <label className="block text-sm text-dark-300 mb-2">
                    Qualité
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {qualityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setQualityLevel(option.value as QualityLevel)
                        }
                        disabled={isLoading}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-left",
                          qualityLevel === option.value
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                        )}
                      >
                        <div className="text-white font-medium text-sm">
                          {option.label}
                        </div>
                        <div className="text-dark-400 text-xs">
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variations */}
                <div>
                  <label className="block text-sm text-dark-300 mb-2">
                    Nombre de variations
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumVariations(num)}
                        disabled={isLoading}
                        className={cn(
                          "p-2 rounded-xl border-2 transition-all",
                          numVariations === num
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                        )}
                      >
                        <div className="text-white font-bold text-center">
                          {num}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm text-dark-300 mb-2">
                    Format de sortie
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOutputFormat("png")}
                      disabled={isLoading}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        outputFormat === "png"
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                      )}
                    >
                      <div className="text-white font-medium text-sm">PNG</div>
                      <div className="text-dark-400 text-xs">
                        Meilleure qualité
                      </div>
                    </button>
                    <button
                      onClick={() => setOutputFormat("jpeg")}
                      disabled={isLoading}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        outputFormat === "jpeg"
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-dark-700 hover:border-dark-600 bg-dark-800/30"
                      )}
                    >
                      <div className="text-white font-medium text-sm">JPEG</div>
                      <div className="text-dark-400 text-xs">Plus léger</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton de génération */}
            <Button
              onClick={generateImages}
              disabled={
                !prompt.trim() || referenceImages.length === 0 || isLoading
              }
              variant="glow"
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Générer les images
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
                Résultats
              </h3>

              {/* État initial */}
              {status === "idle" && generatedImages.length === 0 && !error && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-dark-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Aucune image générée</p>
                    <p className="text-sm">
                      Ajoutez vos images de référence et lancez la génération
                    </p>
                  </div>
                </div>
              )}

              {/* Progression */}
              {isLoading && (
                <div className="space-y-4">
                  <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {message || "Traitement..."}
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

              {/* Images générées */}
              {generatedImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        {generatedImages.length} image(s) générée(s) !
                      </span>
                    </div>
                    <Button onClick={handleReset} variant="outline" size="sm">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Nouvelle
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {generatedImages.map((img, index) => (
                      <div
                        key={index}
                        className="border border-dark-700 rounded-xl overflow-hidden bg-dark-800/30"
                      >
                        {/* Image - Cliquable pour ouvrir en modal */}
                        <div
                          className="relative aspect-square bg-dark-900 cursor-pointer group"
                          onClick={() =>
                            openImageModal(
                              img,
                              prompt,
                              { qualityLevel, numVariations, outputFormat },
                              new Date().toISOString()
                            )
                          }
                        >
                          <img
                            src={img.url}
                            alt={img.filename}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Overlay au survol */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        {/* Informations */}
                        <div className="p-4 space-y-3">
                          <h4 className="text-white font-medium truncate">
                            {img.filename}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-dark-400">Dimensions:</span>
                              <p className="text-white font-medium">
                                {img.width}x{img.height}
                              </p>
                            </div>
                            <div>
                              <span className="text-dark-400">Format:</span>
                              <p className="text-white font-medium uppercase">
                                {img.format}
                              </p>
                            </div>
                            <div>
                              <span className="text-dark-400">Ratio:</span>
                              <p className="text-white font-medium">
                                {img.aspectRatio}
                              </p>
                            </div>
                            <div>
                              <span className="text-dark-400">Fichier:</span>
                              <p className="text-white font-medium truncate">
                                {img.filename}
                              </p>
                            </div>
                          </div>

                          {/* Bouton téléchargement */}
                          <Button
                            onClick={async () => {
                              try {
                                const response = await fetch(img.url);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = img.filename;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (error) {
                                console.error("Erreur téléchargement:", error);
                              }
                            }}
                            variant="default"
                            size="sm"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Section Historique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  Historique
                </h2>
                <p className="text-dark-300 text-sm">
                  {previousGenerations.length} génération(s) précédente(s)
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              size="sm"
            >
              {showHistory ? "Masquer" : "Afficher"}
            </Button>
          </div>

          {showHistory && (
            <div className="space-y-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : previousGenerations.length === 0 ? (
                <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-12 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-dark-600" />
                  <p className="text-dark-400 text-lg">
                    Aucune génération précédente
                  </p>
                  <p className="text-dark-500 text-sm mt-2">
                    Vos images générées apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {previousGenerations.map((generation) =>
                    generation.images.map((image) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-dark-900/50 border border-dark-800/50 rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() =>
                          openImageModal(
                            image,
                            generation.prompt,
                            generation.generationMetadata,
                            generation.createdAt
                          )
                        }
                      >
                        {/* Image */}
                        <div className="relative aspect-square bg-dark-800/30 overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.filename}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {/* Overlay au survol */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        {/* Informations rapides */}
                        <div className="p-4">
                          <p className="text-white font-medium text-sm truncate mb-2">
                            {image.filename}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-dark-400">
                              {image.width}×{image.height}
                            </span>
                            <span className="text-dark-400 uppercase">
                              {image.format}
                            </span>
                          </div>
                          <p className="text-dark-500 text-xs mt-2 line-clamp-2">
                            {generation.prompt}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Modal d'image */}
        {selectedImage && (
          <ImageModal
            isOpen={!!selectedImage}
            onClose={closeImageModal}
            image={selectedImage}
            prompt={selectedPrompt}
            createdAt={selectedCreatedAt}
            additionalMetadata={selectedMetadata}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
