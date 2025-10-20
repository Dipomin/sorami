import { JobStatus } from '../types/book-api';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const translateStatus = (status: JobStatus): string => {
  const translations: Record<JobStatus, string> = {
    pending: 'En attente',
    generating_outline: 'Génération du plan',
    writing_chapters: 'Écriture des chapitres',
    finalizing: 'Finalisation',
    completed: 'Terminé',
    failed: 'Échec',
  };
  return translations[status] || status;
};

export const getStatusColor = (status: JobStatus): string => {
  const colors: Record<JobStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    generating_outline: 'bg-blue-100 text-blue-800',
    writing_chapters: 'bg-indigo-100 text-indigo-800',
    finalizing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const validateBookRequest = (title: string, topic: string, goal: string): string[] => {
  const errors: string[] = [];
  
  if (!title.trim()) {
    errors.push('Le titre est requis');
  }
  
  if (!topic.trim()) {
    errors.push('Le sujet est requis');
  }
  
  if (!goal.trim()) {
    errors.push('L\'objectif est requis');
  }
  
  if (title.length > 100) {
    errors.push('Le titre ne peut pas dépasser 100 caractères');
  }
  
  if (topic.length > 200) {
    errors.push('Le sujet ne peut pas dépasser 200 caractères');
  }
  
  if (goal.length > 1000) {
    errors.push('L\'objectif ne peut pas dépasser 1000 caractères');
  }
  
  return errors;
};