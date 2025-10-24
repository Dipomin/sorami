"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, Zap } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-dark-900/50 backdrop-blur-sm border border-dark-800/50 rounded-2xl p-8 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">
          Créer un article de blog SEO avec l'IA
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-dark-300 mb-2"
          >
            Sujet de l'article *
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            placeholder="ex: Intelligence Artificielle et Marketing Digital en 2025"
            required
            disabled={isLoading}
          />
          <p className="mt-2 text-sm text-dark-400">
            Le sujet principal de votre article de blog
          </p>
        </div>

        <div>
          <label
            htmlFor="goal"
            className="block text-sm font-medium text-dark-300 mb-2"
          >
            Objectif et contexte
          </label>
          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
            placeholder="Décrivez l'objectif de l'article, le public cible, le ton souhaité, et les points clés à couvrir..."
            disabled={isLoading}
          />
          <p className="mt-2 text-sm text-dark-400">
            Optionnel : Plus votre description est détaillée, meilleur sera le
            résultat
          </p>
        </div>

        <div>
          <label
            htmlFor="target_word_count"
            className="block text-sm font-medium text-dark-300 mb-2"
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
            className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            disabled={isLoading}
          />
          <p className="mt-2 text-sm text-dark-400">
            Entre 800 et 5000 mots. Recommandé : 2000-2500 mots pour un article
            complet
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, target_word_count: 1200 }))
              }
              className="px-4 py-2 text-sm bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/50 hover:border-primary-500/50 text-dark-300 hover:text-white rounded-lg transition-all"
              disabled={isLoading}
            >
              Court (1200)
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, target_word_count: 2000 }))
              }
              className="px-4 py-2 text-sm bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/50 hover:border-primary-500/50 text-dark-300 hover:text-white rounded-lg transition-all"
              disabled={isLoading}
            >
              Standard (2000)
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, target_word_count: 3000 }))
              }
              className="px-4 py-2 text-sm bg-dark-800/50 hover:bg-dark-700/50 border border-dark-700/50 hover:border-primary-500/50 text-dark-300 hover:text-white rounded-lg transition-all"
              disabled={isLoading}
            >
              Long (3000)
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.topic}
          className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Génération en cours...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Générer l'article</span>
            </div>
          )}
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-6 bg-primary-500/10 border border-primary-500/20 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-primary-400" />
            <h3 className="text-sm font-semibold text-primary-300">
              Votre article inclura :
            </h3>
          </div>
          <ul className="text-sm text-dark-200 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Titre optimisé SEO (60-70 caractères)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Meta-description persuasive (150-160 caractères)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>
                Structure claire avec introduction, sections et conclusion
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Tags et mots-clés SEO</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Score de qualité SEO (/100)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Analyse de lisibilité</span>
            </li>
          </ul>
        </motion.div>
      </form>
    </motion.div>
  );
};
