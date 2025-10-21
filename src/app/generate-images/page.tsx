"use client";

import React, { useState } from "react";
import { ImageGenerationForm } from "@/components/ImageGenerationForm";
import { ImageProgress } from "@/components/ImageProgress";
import { ImageResults } from "@/components/ImageResults";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type {
  ImageGenerationRequest,
  ImageResultResponse,
} from "@/types/image-api";

export default function GenerateImagesPage() {
  const { generateImage, isGenerating, currentStatus, error, reset } =
    useImageGeneration();

  const [result, setResult] = useState<ImageResultResponse | null>(null);

  const handleSubmit = async (data: ImageGenerationRequest) => {
    setResult(null);

    try {
      const generationResult = await generateImage(data);
      setResult(generationResult);
    } catch (err) {
      console.error("Erreur lors de la génération:", err);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Génération d'Images IA
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Créez des images uniques avec l'intelligence artificielle
                </p>
              </div>
            </div>

            {(isGenerating || result) && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isGenerating}
              >
                Nouvelle génération
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche: Formulaire */}
          <div className="space-y-6">
            <ImageGenerationForm
              onSubmit={handleSubmit}
              isLoading={isGenerating}
            />

            {/* Guide rapide */}
            {!isGenerating && !result && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  💡 Conseils pour de meilleurs résultats
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>
                      Soyez précis dans votre description (couleurs, style,
                      ambiance)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>
                      Utilisez une image source pour des variations créatives
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>Choisissez le style adapté à votre projet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>La qualité "Ultra" offre les meilleurs détails</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Colonne droite: Statut et résultats */}
          <div className="space-y-6">
            {/* Afficher les erreurs */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-900 mb-1">
                    Erreur lors de la génération
                  </h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Afficher le statut pendant la génération */}
            {isGenerating && currentStatus && (
              <ImageProgress status={currentStatus} />
            )}

            {/* Afficher les résultats */}
            {result && !isGenerating && <ImageResults result={result} />}

            {/* Placeholder initial */}
            {!isGenerating && !result && !error && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-purple-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Prêt à créer
                </h3>
                <p className="text-gray-600">
                  Remplissez le formulaire et cliquez sur "Générer" pour créer
                  vos images
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Exemples de prompts */}
        {!isGenerating && !result && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎨 Exemples de prompts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  Paysage naturel
                </p>
                <p className="text-xs text-purple-700">
                  "Un magnifique lac de montagne entouré de forêts de pins, avec
                  un lever de soleil doré se reflétant sur l'eau calme"
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                <p className="text-sm font-medium text-pink-900 mb-2">
                  Art conceptuel
                </p>
                <p className="text-xs text-pink-700">
                  "Une ville futuriste cyberpunk avec des néons bleus et roses,
                  des voitures volantes et des gratte-ciels immenses sous la
                  pluie"
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Portrait créatif
                </p>
                <p className="text-xs text-blue-700">
                  "Portrait d'un chat astronaute portant un casque spatial
                  détaillé, fond d'étoiles et de nébuleuses colorées"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
