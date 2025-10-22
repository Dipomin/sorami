/**
 * Formulaire de génération de vidéos
 * Permet de saisir les paramètres pour générer une vidéo avec Gemini Veo 2.0
 */

"use client";

import { useState } from "react";
import { Film, Image, Settings, Sparkles } from "lucide-react";
import type {
  VideoGenerationRequest,
  VideoAspectRatio,
  PersonGeneration,
} from "@/types/video-api";

interface VideoGenerationFormProps {
  onSubmit: (request: VideoGenerationRequest) => void;
  isLoading: boolean;
}

export default function VideoGenerationForm({
  onSubmit,
  isLoading,
}: VideoGenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [numberOfVideos, setNumberOfVideos] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState(8);
  const [personGeneration, setPersonGeneration] =
    useState<PersonGeneration>("ALLOW_ALL");
  const [inputImageBase64, setInputImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Extraire seulement la partie base64 (sans le préfixe data:image/...)
        const base64Data = base64.split(",")[1];
        setInputImageBase64(base64Data);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      alert("Veuillez entrer une description de la vidéo");
      return;
    }

    const request: VideoGenerationRequest = {
      prompt: prompt.trim(),
      aspect_ratio: aspectRatio,
      number_of_videos: numberOfVideos,
      duration_seconds: durationSeconds,
      person_generation: personGeneration,
      input_image_base64: inputImageBase64,
      save_to_cloud: false,
    };

    onSubmit(request);
  };

  const examplePrompts = [
    "Un lever de soleil cinématographique sur l'océan Pacifique avec des vagues douces",
    "Un chat astronaute flottant dans l'espace avec des étoiles scintillantes",
    "Une cascade majestueuse dans une forêt tropicale avec des oiseaux colorés",
    "Un coucher de soleil sur une plage tropicale avec des palmiers se balançant doucement",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt principal */}
      <div>
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          <Film className="inline-block w-4 h-4 mr-2" />
          Description de la vidéo *
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Un magnifique lever de soleil sur l'océan avec des vagues douces et des mouettes volant dans le ciel..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-y"
          disabled={isLoading}
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          Soyez descriptif et précis. Mentionnez les mouvements de caméra,
          l&apos;ambiance, et les détails visuels.
        </p>

        {/* Exemples de prompts */}
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-gray-600">
            💡 Exemples de descriptions :
          </p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(example)}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                disabled={isLoading}
              >
                {example.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload image (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Image className="inline-block w-4 h-4 mr-2" />
          Image de référence (optionnel)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {imagePreview && (
          <div className="mt-3">
            <img
              src={imagePreview}
              alt="Aperçu"
              className="max-w-xs rounded-lg border border-gray-200 shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                setInputImageBase64(null);
                setImagePreview(null);
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
              disabled={isLoading}
            >
              Supprimer l&apos;image
            </button>
          </div>
        )}
      </div>

      {/* Options avancées */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          disabled={isLoading}
        >
          <Settings className="w-4 h-4 mr-2" />
          Options avancées
          <span className="ml-2">{showAdvanced ? "▲" : "▼"}</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            {/* Ratio d'aspect */}
            <div>
              <label
                htmlFor="aspectRatio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ratio d&apos;aspect
              </label>
              <select
                id="aspectRatio"
                value={aspectRatio}
                onChange={(e) =>
                  setAspectRatio(e.target.value as VideoAspectRatio)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="16:9">16:9 (Standard - 1920x1080)</option>
                <option value="16:10">16:10 (Large - 1920x1200)</option>
              </select>
            </div>

            {/* Durée */}
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Durée: {durationSeconds} secondes
              </label>
              <input
                type="range"
                id="duration"
                min="5"
                max="8"
                step="1"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className="w-full"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5s</span>
                <span>8s</span>
              </div>
            </div>

            {/* Nombre de vidéos */}
            <div>
              <label
                htmlFor="numberOfVideos"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre de vidéos: {numberOfVideos}
              </label>
              <input
                type="range"
                id="numberOfVideos"
                min="1"
                max="4"
                step="1"
                value={numberOfVideos}
                onChange={(e) => setNumberOfVideos(Number(e.target.value))}
                className="w-full"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>4</span>
              </div>
            </div>

            {/* Génération de personnes */}
            <div>
              <label
                htmlFor="personGeneration"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Génération de personnes
              </label>
              <select
                id="personGeneration"
                value={personGeneration}
                onChange={(e) =>
                  setPersonGeneration(e.target.value as PersonGeneration)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="ALLOW_ALL">
                  Autoriser toutes les personnes
                </option>
                <option value="DENY_ALL">Interdire les personnes</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Génération en cours...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Générer la vidéo
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        ⚡ Temps de génération moyen: 30 secondes à 2 minutes • Modèle: Gemini
        Veo 2.0
      </p>
    </form>
  );
}
