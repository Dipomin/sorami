"use client";

import React, { useState } from "react";
import { BookRequest } from "../types/book-api";
import { validateBookRequest } from "../utils/book-utils";

interface BookCreationFormProps {
  onSubmit: (data: BookRequest) => void;
  isLoading: boolean;
  className?: string;
}

export const BookCreationForm: React.FC<BookCreationFormProps> = ({
  onSubmit,
  isLoading,
  className = "",
}) => {
  const [formData, setFormData] = useState<BookRequest>({
    title: "",
    topic: "",
    goal: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  console.log("Form Data:", formData);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Créer un nouveau livre avec l'IA
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Titre du livre *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ex: Guide complet de l'IA en 2025"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sujet principal *
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ex: Intelligence Artificielle et Applications Pratiques"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="goal"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Objectif et description *
          </label>
          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez l'objectif du livre, le public cible, et les points clés à aborder..."
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={
            isLoading || !formData.title || !formData.topic || !formData.goal
          }
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Création en cours...
            </div>
          ) : (
            "Créer le livre"
          )}
        </button>
      </form>
    </div>
  );
};
