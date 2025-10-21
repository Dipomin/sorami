"use client";

import React, { useState } from "react";
import { BlogRequest } from "../types/blog-api";

interface BlogCreationFormProps {
  onSubmit: (data: BlogRequest) => void;
  isLoading: boolean;
  className?: string;
}

export const BlogCreationForm: React.FC<BlogCreationFormProps> = ({
  onSubmit,
  isLoading,
  className = "",
}) => {
  const [formData, setFormData] = useState<BlogRequest>({
    topic: "",
    goal: "",
    target_word_count: 2000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "target_word_count" ? parseInt(value) || 2000 : value,
    }));
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Créer un article de blog SEO avec l'IA
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sujet de l'article *
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ex: Intelligence Artificielle et Marketing Digital en 2025"
            required
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Le sujet principal de votre article de blog
          </p>
        </div>

        <div>
          <label
            htmlFor="goal"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Objectif et contexte
          </label>
          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez l'objectif de l'article, le public cible, le ton souhaité, et les points clés à couvrir..."
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Optionnel : Plus votre description est détaillée, meilleur sera le
            résultat
          </p>
        </div>

        <div>
          <label
            htmlFor="target_word_count"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nombre de mots cible
          </label>
          <input
            type="number"
            id="target_word_count"
            name="target_word_count"
            value={formData.target_word_count}
            onChange={handleChange}
            min={800}
            max={5000}
            step={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Entre 800 et 5000 mots. Recommandé : 2000-2500 mots pour un article
            complet
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, target_word_count: 1200 }))
              }
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              disabled={isLoading}
            >
              Court (1200)
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, target_word_count: 2000 }))
              }
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              disabled={isLoading}
            >
              Standard (2000)
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, target_word_count: 3000 }))
              }
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              disabled={isLoading}
            >
              Long (3000)
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.topic}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Génération en cours...
            </div>
          ) : (
            "Générer l'article"
          )}
        </button>

        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📊 Votre article inclura :
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Titre optimisé SEO (60-70 caractères)</li>
            <li>✅ Meta-description persuasive (150-160 caractères)</li>
            <li>
              ✅ Structure claire avec introduction, sections et conclusion
            </li>
            <li>✅ Tags et mots-clés SEO</li>
            <li>✅ Score de qualité SEO (/100)</li>
            <li>✅ Analyse de lisibilité</li>
          </ul>
        </div>
      </form>
    </div>
  );
};
