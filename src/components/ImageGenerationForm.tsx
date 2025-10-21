"use client";

import React, { useState } from "react";
import { Upload, Loader2, Sparkles, Image as ImageIcon, X } from "lucide-react";
import type { ImageGenerationRequest } from "../types/image-api";

interface ImageGenerationFormProps {
  onSubmit: (data: ImageGenerationRequest) => void;
  isLoading: boolean;
  className?: string;
}

export const ImageGenerationForm: React.FC<ImageGenerationFormProps> = ({
  onSubmit,
  isLoading,
  className = "",
}) => {
  const [formData, setFormData] = useState<ImageGenerationRequest>({
    prompt: "",
    input_image_url: "",
    num_images: 1,
    size: "1024x1024",
    format: "PNG",
    style: "photorealistic",
    quality: "high",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Supprimer input_image_url si vide
    const submitData = { ...formData };
    if (
      !submitData.input_image_url ||
      submitData.input_image_url.trim() === ""
    ) {
      delete submitData.input_image_url;
    }

    onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, input_image_url: url }));

    // Mettre à jour la prévisualisation
    if (url && url.trim() !== "") {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const clearImageUrl = () => {
    setFormData((prev) => ({ ...prev, input_image_url: "" }));
    setImagePreview(null);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Générer des images avec l'IA
          </h2>
          <p className="text-sm text-gray-500">
            Propulsé par Google Gemini 2.0 Flash
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prompt */}
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description de l'image <span className="text-red-500">*</span>
          </label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            placeholder="Ex: Un magnifique coucher de soleil sur l'océan avec des vagues dorées et un ciel pastel..."
            required
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Décrivez en détail l'image que vous souhaitez générer
          </p>
        </div>

        {/* Image source optionnelle */}
        <div>
          <label
            htmlFor="input_image_url"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Image source (optionnel)
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="url"
                id="input_image_url"
                name="input_image_url"
                value={formData.input_image_url || ""}
                onChange={handleImageUrlChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://example.com/image.jpg"
                disabled={isLoading}
              />
              {formData.input_image_url && (
                <button
                  type="button"
                  onClick={clearImageUrl}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Utilisez une image comme base pour la génération multimodale
          </p>

          {imagePreview && (
            <div className="mt-3 relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={imagePreview}
                alt="Prévisualisation"
                className="w-full h-48 object-cover"
                onError={() => setImagePreview(null)}
              />
            </div>
          )}
        </div>

        {/* Options avancées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre d'images */}
          <div>
            <label
              htmlFor="num_images"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre d'images
            </label>
            <select
              id="num_images"
              name="num_images"
              value={formData.num_images}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            >
              <option value={1}>1 image</option>
              <option value={2}>2 images</option>
              <option value={3}>3 images</option>
              <option value={4}>4 images</option>
            </select>
          </div>

          {/* Taille */}
          <div>
            <label
              htmlFor="size"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Dimensions
            </label>
            <select
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            >
              <option value="512x512">512x512 (Carré petit)</option>
              <option value="1024x1024">1024x1024 (Carré standard)</option>
              <option value="1792x1024">1792x1024 (Paysage)</option>
            </select>
          </div>

          {/* Style */}
          <div>
            <label
              htmlFor="style"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Style visuel
            </label>
            <select
              id="style"
              name="style"
              value={formData.style}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            >
              <option value="photorealistic">Photoréaliste</option>
              <option value="artistic">Artistique</option>
              <option value="illustration">Illustration</option>
              <option value="3d-render">Rendu 3D</option>
            </select>
          </div>

          {/* Qualité */}
          <div>
            <label
              htmlFor="quality"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Qualité
            </label>
            <select
              id="quality"
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            >
              <option value="standard">Standard</option>
              <option value="high">Haute</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label
              htmlFor="format"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Format de sortie
            </label>
            <select
              id="format"
              name="format"
              value={formData.format}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            >
              <option value="PNG">PNG</option>
              <option value="JPEG">JPEG</option>
              <option value="WEBP">WebP</option>
            </select>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading || !formData.prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              <span>
                Générer{" "}
                {(formData.num_images || 1) > 1
                  ? `${formData.num_images} images`
                  : "l'image"}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
