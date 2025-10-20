"use client";

import React from "react";
import { useJobs } from "../../hooks/useJobs";
import Link from "next/link";
import type { JobStatus } from '@prisma/client';

const JobsPage: React.FC = () => {
  const { jobs, loading, error, refreshJobs } = useJobs();

  const translateStatus = (status: JobStatus) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'RUNNING':
        return 'En cours';
      case 'GENERATING_OUTLINE':
        return 'Génération du plan';
      case 'WRITING_CHAPTERS':
        return 'Écriture des chapitres';
      case 'FINALIZING':
        return 'Finalisation';
      case 'COMPLETED':
        return 'Terminé';
      case 'FAILED':
        return 'Échoué';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'RUNNING':
      case 'GENERATING_OUTLINE':
      case 'WRITING_CHAPTERS':
      case 'FINALIZING':
        return 'text-blue-600 bg-blue-100';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
          <button
            onClick={refreshJobs}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mes Jobs de Génération
          </h1>
          <p className="text-gray-600">
            Suivez le statut de vos livres en cours de génération
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={refreshJobs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualiser
          </button>
          <Link
            href="/create"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Nouveau Livre
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Aucun job trouvé
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore créé de livre. Commencez par créer votre premier livre !
            </p>
            <Link
              href="/create"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer mon premier livre
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Job #{job.id.slice(0, 8)}...
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {translateStatus(job.status)}
                      </span>
                      {job.progress !== undefined && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {job.progress}%
                          </span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Voir détails
                  </Link>
                </div>

                {job.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 text-sm">{job.error}</p>
                  </div>
                )}

                {job.status === 'COMPLETED' && (
                  <div className="mt-4 flex space-x-2">
                    <Link
                      href="/books"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Voir le livre
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;