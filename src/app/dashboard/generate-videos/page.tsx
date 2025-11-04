/**
 * Page de génération de vidéos
 * Permet de créer des vidéos cinématographiques avec Gemini Veo 2.0
 */

"use client";

import { useState } from "react";
import { Film, ArrowLeft, RefreshCw, Sparkles, Info } from "lucide-react";
import Link from "next/link";
import VideoGenerationForm from "@/components/VideoGenerationForm";
import VideoProgress from "@/components/VideoProgress";
import VideoResults from "@/components/VideoResults";
import UserVideosGallery from "@/components/UserVideosGallery";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";

export default function GenerateVideosPage() {
  const {
    generateVideo,
    isGenerating,
    currentStatus,
    result,
    error,
    progress,
    reset,
  } = useVideoGeneration();

  const handleGenerate = async (request: any) => {
    await generateVideo(request);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Film className="w-10 h-10 mr-3 text-blue-600" />
                Génération de Vidéos
              </h1>
              <p className="text-gray-600 text-lg">
                Créez des vidéos cinématographiques avec{" "}
                <span className="font-semibold text-blue-600">
                  Gemini Veo 3.1
                </span>
              </p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                IA de génération vidéo de pointe par Google
              </div>
            </div>
          </div>
        </div>

        {/* Bannière d'information */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">
              À propos de la génération de vidéos
            </p>
            <p>
              Les vidéos sont générées en <strong>5 à 8 secondes</strong> au
              format <strong>Full HD (1920x1080)</strong>. La génération peut
              prendre jusqu&apos;à <strong>2 minutes</strong>. Soyez patient et
              précis dans vos descriptions pour obtenir les meilleurs résultats.
            </p>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche: Formulaire */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                Paramètres de génération
              </h2>
              <VideoGenerationForm
                onSubmit={handleGenerate}
                isLoading={isGenerating}
              />
            </div>
          </div>

          {/* Colonne droite: Résultats */}
          <div className="space-y-6">
            {/* Affichage de l'erreur */}
            {error && !isGenerating && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-red-900">
                      Erreur lors de la génération
                    </h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    <button
                      onClick={handleReset}
                      className="mt-3 inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Affichage de la progression */}
            {(isGenerating || currentStatus) && !result && (
              <div className="space-y-4">
                {currentStatus && <VideoProgress status={currentStatus} />}
              </div>
            )}

            {/* Affichage des résultats */}
            {result && !isGenerating && (
              <div className="space-y-4">
                <VideoResults result={result} />

                <button
                  onClick={handleReset}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Générer une nouvelle vidéo
                </button>
              </div>
            )}

            {/* État initial */}
            {!isGenerating && !currentStatus && !result && !error && (
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Film className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Prêt à créer votre vidéo ?
                </h3>
                <p className="text-gray-600 mb-6">
                  Remplissez le formulaire ci-contre avec une description
                  détaillée pour commencer la génération de votre vidéo.
                </p>

                {/* Conseils */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    💡 Conseils pour de meilleurs résultats
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>
                        <strong>Soyez descriptif:</strong> Mentionnez
                        l&apos;ambiance, l&apos;éclairage, et les détails
                        visuels
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>
                        <strong>Mouvements de caméra:</strong> Précisez si vous
                        voulez un mouvement fluide, un zoom, etc.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>
                        <strong>Style cinématographique:</strong> Utilisez des
                        termes comme &quot;cinématographique&quot;,
                        &quot;dramatique&quot;, &quot;serein&quot;
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>
                        <strong>Image de référence:</strong> Ajoutez une image
                        pour guider le style visuel (optionnel)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Galerie des vidéos générées */}
        <div className="mt-12">
          <UserVideosGallery />
        </div>

        {/* Section d'exemples */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-yellow-500" />
            Exemples de prompts professionnels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                🌅 Paysages naturels
              </h3>
              <p className="text-sm text-gray-700 italic">
                &quot;Un lever de soleil cinématographique sur l&apos;océan
                Pacifique, avec des vagues douces s&apos;écrasant sur la plage,
                des mouettes volant dans le ciel orange et rose, mouvement de
                caméra fluide de gauche à droite, ambiance paisible et
                sereine&quot;
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                🚀 Science-fiction
              </h3>
              <p className="text-sm text-gray-700 italic">
                &quot;Un chat astronaute flottant dans l&apos;espace profond
                avec des étoiles scintillantes et une nébuleuse colorée en
                arrière-plan, mouvement lent et gracieux, éclairage spatial
                dramatique, style cinématographique futuriste&quot;
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                🌿 Nature sauvage
              </h3>
              <p className="text-sm text-gray-700 italic">
                &quot;Une cascade majestueuse dans une forêt tropicale
                luxuriante, avec des oiseaux colorés volant entre les arbres,
                rayon de soleil perçant à travers la canopée, mouvement de
                caméra vertical ascendant, ambiance mystique et verdoyante&quot;
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-5 border border-orange-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                🏖️ Détente tropicale
              </h3>
              <p className="text-sm text-gray-700 italic">
                &quot;Un coucher de soleil vibrant sur une plage tropicale avec
                des palmiers se balançant doucement dans la brise, vagues calmes
                léchant le sable blanc, mouvement panoramique lent de droite à
                gauche, couleurs chaudes et dorées&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
