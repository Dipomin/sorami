"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { pollBookJobStatus } from "../../../lib/api";
import type { JobStatus } from '@prisma/client';

interface Job {
  id: string;
  status: JobStatus;
  progress?: number;
  error?: string;
}

const JobDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!jobId) return;

      try {
        setLoading(true);
        setError(null);

        const result = await pollBookJobStatus(jobId);
        setJob({
          id: jobId,
          status: result.status,
          progress: typeof result.progress === 'number' ? result.progress : undefined,
          error: result.error
        });
      } catch (err) {
        console.error("Erreur lors du chargement du job:", err);
        setError("Erreur lors du chargement du job");
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId]);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'RUNNING':
      case 'GENERATING_OUTLINE':
      case 'WRITING_CHAPTERS':
      case 'FINALIZING':
        return 'text-blue-600';
      case 'COMPLETED':
        return 'text-green-600';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Erreur</h1>
            <p className="text-red-700">{error}</p>
            <Link
              href="/jobs"
              className="inline-block mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retour aux jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Job introuvable</h1>
            <Link
              href="/jobs"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retour aux jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Détails du Job
            </h1>
            <p className="text-gray-600">ID: {job.id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Informations générales
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Statut:</span>
                  <span className={`ml-2 font-semibold ${getStatusColor(job.status)}`}>
                    {translateStatus(job.status)}
                  </span>
                </div>
                {job.progress !== undefined && (
                  <div>
                    <span className="font-medium text-gray-700">Progression:</span>
                    <span className="ml-2">{job.progress}%</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {job.error && (
                  <div>
                    <span className="font-medium text-red-700">Erreur:</span>
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-sm">{job.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/jobs"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Retour aux jobs
            </Link>
            {job.status === 'COMPLETED' && (
              <Link
                href="/books"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Voir les livres
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;