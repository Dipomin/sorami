"use client";

import React from "react";
import { useBookCreation } from "../hooks/useBookCreation";
import { BookCreationForm } from "./BookCreationForm";

const BookForm = () => {
  const { isLoading, error, createBook, clearError, reset, jobId } =
    useBookCreation();

  // Adapter la fonction createBook pour correspondre à l'interface BookCreationForm
  const handleBookSubmit = async (data: {
    title: string;
    topic: string;
    goal: string;
  }) => {
    const bookRequest = {
      title: data.title,
      topic: data.topic,
      goal: data.goal,
      chapters: [
        { title: "Introduction", description: "Introduction au sujet" },
        { title: "Développement", description: "Développement principal" },
        { title: "Conclusion", description: "Conclusion et résumé" },
      ],
    };

    await createBook(bookRequest);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Générateur de Livres IA
          </h1>
          <p className="text-lg text-gray-600">
            Créez des livres complets en quelques minutes grâce à l'intelligence
            artificielle
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!jobId && (
            <BookCreationForm
              onSubmit={handleBookSubmit}
              isLoading={isLoading}
            />
          )}

          {jobId && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-xl font-semibold text-green-600 mb-4">
                Livre en cours de génération !
              </h2>
              <p className="text-gray-600 mb-4">Job ID: {jobId}</p>
              <p className="text-gray-600 mb-4">
                Votre livre est en cours de génération. Vous pouvez suivre le
                progrès dans l'onglet "Jobs".
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={reset}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Créer un nouveau livre
                </button>
                <a
                  href="/jobs"
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Voir les jobs
                </a>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Erreur</p>
              <p>{error}</p>
              <button
                onClick={clearError}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-900 mb-3">
            Comment ça marche ?
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Définissez le titre et le sujet de votre livre</li>
            <li>Décrivez l'objectif et le contenu souhaité</li>
            <li>L'IA génère automatiquement un plan détaillé</li>
            <li>Chaque chapitre est écrit de manière approfondie</li>
            <li>Téléchargez votre livre complet au format approprié</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BookForm;
