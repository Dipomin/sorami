/**
 * Composant de gestion d'images S3 pour le blog
 * Modal moderne avec upload, prévisualisation, rognage, suppression
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Download,
  Search,
  Grid3x3,
  List,
  Crop as CropIcon,
  Check,
  Loader2,
  FileImage,
  AlertCircle,
} from "lucide-react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";

interface ImageFile {
  url: string;
  key: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

interface S3ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (imageUrl: string) => void;
  currentImage?: string;
  allowMultiple?: boolean;
}

export function S3ImageManager({
  isOpen,
  onClose,
  onSelect,
  currentImage,
  allowMultiple = false,
}: S3ImageManagerProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  // Convertir une URL S3 en URL proxy pour éviter les erreurs CORS
  const getProxyUrl = (s3Url: string): string => {
    try {
      // Extraire la clé de l'image depuis l'URL S3
      const url = new URL(s3Url);
      const key = url.pathname.substring(1); // Enlever le "/" initial
      return `/api/blog/image-proxy?key=${encodeURIComponent(key)}`;
    } catch (error) {
      console.error("Error parsing S3 URL:", error);
      return s3Url; // Fallback vers l'URL originale
    }
  };

  // Charger les images au montage
  React.useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  // Charger les images existantes
  const loadImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/blog/images");
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload d'images
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedImages: ImageFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/blog/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const result = await response.json();
        uploadedImages.push({
          url: result.url,
          key: result.fileName,
          name: file.name,
          size: result.size,
          uploadedAt: new Date(),
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setImages((prev) => [...uploadedImages, ...prev]);
      setUploadProgress(0);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload des images");
    } finally {
      setIsUploading(false);
    }
  };

  // Suppression d'image
  const handleDelete = async (imageKey: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;

    try {
      const response = await fetch("/api/blog/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: imageKey }),
      });

      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.key !== imageKey));
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Sélection d'image
  const handleSelectImage = (imageUrl: string) => {
    if (allowMultiple) {
      setSelectedImages((prev) =>
        prev.includes(imageUrl)
          ? prev.filter((url) => url !== imageUrl)
          : [...prev, imageUrl]
      );
    } else {
      if (onSelect) {
        onSelect(imageUrl);
        onClose();
      }
    }
  };

  // Filtrage des images
  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialiser le crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    // Créer un crop initial de 90% de la largeur avec ratio 16:9
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "px",
          width: width * 0.9,
        },
        16 / 9,
        width,
        height
      ),
      width,
      height
    );

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  // Appliquer le crop
  const handleCropComplete = async () => {
    if (!completedCrop || !cropImageRef.current || !cropImage) {
      alert("Veuillez sélectionner une zone à rogner");
      return;
    }

    // Vérifier que le crop a des dimensions valides
    if (!completedCrop.width || !completedCrop.height) {
      alert("La zone de rognage est trop petite");
      return;
    }

    setIsUploading(true);

    try {
      const canvas = document.createElement("canvas");
      const image = cropImageRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Impossible de créer le canvas");
      }

      // Calculer les facteurs d'échelle
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Convertir les coordonnées du crop en pixels si nécessaire
      let cropX = completedCrop.x;
      let cropY = completedCrop.y;
      let cropWidth = completedCrop.width;
      let cropHeight = completedCrop.height;

      // Si le crop est en pourcentage, convertir en pixels
      if (completedCrop.unit === "%") {
        cropX = (completedCrop.x * image.width) / 100;
        cropY = (completedCrop.y * image.height) / 100;
        cropWidth = (completedCrop.width * image.width) / 100;
        cropHeight = (completedCrop.height * image.height) / 100;
      }

      // Définir les dimensions du canvas
      canvas.width = cropWidth * scaleX;
      canvas.height = cropHeight * scaleY;

      // Dessiner l'image rognée sur le canvas
      ctx.drawImage(
        image,
        cropX * scaleX,
        cropY * scaleY,
        cropWidth * scaleX,
        cropHeight * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convertir en blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            alert("Erreur lors de la conversion de l'image");
            setIsUploading(false);
            return;
          }

          const formData = new FormData();
          formData.append("file", blob, "cropped-image.webp");

          try {
            const response = await fetch("/api/blog/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Upload échoué");
            }

            const result = await response.json();

            // Ajouter la nouvelle image en haut de la liste
            setImages((prev) => [
              {
                url: result.url,
                key: result.fileName,
                name: "cropped-image.webp",
                size: result.size,
                uploadedAt: new Date(),
              },
              ...prev,
            ]);

            // Fermer le modal de crop
            setCropImage(null);
            setCrop(undefined);
            setCompletedCrop(undefined);

            alert("Image rognée avec succès !");
          } catch (error: any) {
            console.error("Crop upload error:", error);
            alert(`Erreur lors de l'upload: ${error.message}`);
          } finally {
            setIsUploading(false);
          }
        },
        "image/webp",
        0.95
      ); // Qualité WebP 95%
    } catch (error: any) {
      console.error("Crop error:", error);
      alert(`Erreur lors du rognage: ${error.message}`);
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-violet-500" />
                Gestionnaire d'Images
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Gérez vos images de blog (Upload, Rogner, Supprimer)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-4">
              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                multiple
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upload... {Math.round(uploadProgress)}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Uploader
                  </>
                )}
              </button>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher une image..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 200px)" }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FileImage className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Aucune image trouvée</p>
                <p className="text-sm mt-2">
                  Cliquez sur "Uploader" pour ajouter des images
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <ImageCard
                    key={image.key}
                    image={image}
                    isSelected={selectedImages.includes(image.url)}
                    onSelect={() => handleSelectImage(image.url)}
                    onDelete={() => handleDelete(image.key)}
                    onCrop={() => setCropImage(getProxyUrl(image.url))}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredImages.map((image) => (
                  <ImageListItem
                    key={image.key}
                    image={image}
                    isSelected={selectedImages.includes(image.url)}
                    onSelect={() => handleSelectImage(image.url)}
                    onDelete={() => handleDelete(image.key)}
                    onCrop={() => setCropImage(getProxyUrl(image.url))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Crop Modal - Plein écran */}
          {cropImage && (
            <div className="fixed inset-0 bg-black/95 flex flex-col z-50">
              {/* Header fixe */}
              <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CropIcon className="w-6 h-6 text-violet-500" />
                    Rogner l'image - Ajustez la zone puis validez
                  </h3>
                  <button
                    onClick={() => {
                      setCropImage(null);
                      setCrop(undefined);
                      setCompletedCrop(undefined);
                    }}
                    disabled={isUploading}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Zone de crop - scrollable si besoin */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                <div className="w-full max-w-7xl">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={16 / 9}
                    className="max-w-full"
                  >
                    <img
                      ref={cropImageRef}
                      src={cropImage}
                      alt="Crop"
                      onLoad={onImageLoad}
                      crossOrigin="anonymous"
                      className="max-w-full h-auto"
                      style={{ maxHeight: "calc(100vh - 200px)" }}
                    />
                  </ReactCrop>
                </div>
              </div>

              {/* Footer fixe avec boutons */}
              <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                  <div className="text-sm text-slate-400">
                    💡 Astuce : Glissez les coins pour redimensionner, cliquez
                    au centre pour déplacer
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setCropImage(null);
                        setCrop(undefined);
                        setCompletedCrop(undefined);
                      }}
                      disabled={isUploading}
                      className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCropComplete}
                      disabled={isUploading || !completedCrop}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base font-medium"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 inline mr-2" />
                          Valider et Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Composant carte image (vue grille)
interface ImageCardProps {
  image: ImageFile;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onCrop: () => void;
}

function ImageCard({
  image,
  isSelected,
  onSelect,
  onDelete,
  onCrop,
}: ImageCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative group rounded-lg overflow-hidden bg-slate-800 border-2 transition-all ${
        isSelected
          ? "border-violet-500 shadow-lg shadow-violet-500/20"
          : "border-slate-700 hover:border-slate-600"
      }`}
    >
      <div className="aspect-video relative">
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Overlay with actions */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={onSelect}
          className="p-2 bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          title="Sélectionner"
        >
          <Check className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={onCrop}
          className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          title="Rogner"
        >
          <CropIcon className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 bg-slate-900/50 backdrop-blur-sm">
        <p className="text-sm text-white truncate">{image.name}</p>
        <p className="text-xs text-slate-400 mt-1">
          {(image.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </motion.div>
  );
}

// Composant item liste (vue liste)
function ImageListItem({
  image,
  isSelected,
  onSelect,
  onDelete,
  onCrop,
}: ImageCardProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        isSelected
          ? "bg-violet-900/20 border-violet-500"
          : "bg-slate-800 border-slate-700 hover:border-slate-600"
      }`}
    >
      <img
        src={image.url}
        alt={image.name}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <p className="text-white font-medium">{image.name}</p>
        <p className="text-sm text-slate-400">
          {(image.size / 1024).toFixed(1)} KB •{" "}
          {new Date(image.uploadedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSelect}
          className={`p-2 rounded-lg transition-colors ${
            isSelected
              ? "bg-violet-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onCrop}
          className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CropIcon className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
