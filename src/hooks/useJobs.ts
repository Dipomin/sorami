import { useState, useEffect } from 'react';
import { pollBookJobStatus } from '../lib/api';
import type { JobStatus } from '@prisma/client';

interface Job {
    id: string;
    status: JobStatus;
    progress?: number;
    error?: string;
}

interface UseJobsReturn {
    jobs: Job[];
    loading: boolean;
    error: string | null;
    refreshJobs: () => Promise<void>;
}

export const useJobs = (): UseJobsReturn => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Récupération des jobs depuis le localStorage
            const savedJobs = localStorage.getItem('user-jobs');
            if (savedJobs) {
                const jobIds = JSON.parse(savedJobs) as string[];
                const jobPromises = jobIds.map(async (jobId) => {
                    try {
                        const result = await pollBookJobStatus(jobId);
                        return {
                            id: jobId,
                            status: result.status,
                            progress: typeof result.progress === 'number' ? result.progress : undefined,
                            error: result.error
                        } as Job;
                    } catch (err) {
                        console.error(`Erreur pour le job ${jobId}:`, err);
                        return null;
                    }
                });
                
                const jobResults = await Promise.all(jobPromises);
                const validJobs = jobResults.filter((job): job is Job => job !== null);
                setJobs(validJobs);
            } else {
                setJobs([]);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des jobs:', err);
            setError('Erreur lors du chargement des jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshJobs();
    }, []);

    return {
        jobs,
        loading,
        error,
        refreshJobs,
    };
};