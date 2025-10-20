"use client";

import React from "react";
import { JobStatusResponse, JobStatus } from "../types/book-api";
import { translateStatus } from "../utils/book-utils";

interface BookProgressIndicatorProps {
  job: JobStatusResponse | null;
  error: string | null;
  getProgressPercentage: () => number;
  getStatusColor: () => string;
  onDownload?: () => void;
  onReset?: () => void;
  className?: string;
}

export const BookProgressIndicator: React.FC<BookProgressIndicatorProps> = ({
  job,
  error,
  getProgressPercentage,
  getStatusColor,
  onDownload,
  onReset,
  className = "",
}) => {
  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
        {onReset && (
          <div className="mt-4">
            <button
              onClick={onReset}
              className="bg-red-600 text-white px-4 py-2 text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!job) return null;

  const progress = getProgressPercentage();
  const statusColor = getStatusColor();
  const isCompleted = job.status === "completed";

  const getStatusIcon = () => {
    switch (job.status) {
      case "completed":
        return (
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "failed":
        return (
          <svg
            className="h-5 w-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        );
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case "pending":
        return "En attente...";
      case "generating_outline":
        return "Génération du plan...";
      case "writing_chapters":
        return "Écriture des chapitres...";
      case "finalizing":
        return "Finalisation...";
      case "completed":
        return "Livre terminé !";
      case "failed":
        return "Échec";
      default:
        return job.message;
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {getStatusIcon()}
          <h3 className="ml-2 text-lg font-medium text-gray-900">
            {getStatusText()}
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          Job ID: {job.job_id.slice(0, 8)}...
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{job.message}</p>

      {job.total_chapters > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progrès</span>
            <span>
              {job.chapters_completed} / {job.total_chapters} chapitres
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-${statusColor}-500 h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">
            {progress}%
          </div>
        </div>
      )}

      {job.book_outline && job.book_outline.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Plan du livre:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {job.book_outline.slice(0, 3).map((chapter, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                {chapter.title}
              </li>
            ))}
            {job.book_outline.length > 3 && (
              <li className="text-gray-400">
                ... et {job.book_outline.length - 3} autres chapitres
              </li>
            )}
          </ul>
        </div>
      )}

      {isCompleted && onDownload && (
        <div className="flex space-x-3">
          <button
            onClick={onDownload}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            📥 Télécharger le livre
          </button>
          {onReset && (
            <button
              onClick={onReset}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Nouveau livre
            </button>
          )}
        </div>
      )}
    </div>
  );
};
