// Fonctions utilitaires pour l'application sorami

import { BookResult } from './types';

/**
 * Formate une date en français
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calcule le pourcentage de progression
 */
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Traduit le statut en français
 */
export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    pending: 'En attente',
    generating_outline: 'Génération du plan',
    writing_chapters: 'Écriture des chapitres',
    finalizing: 'Finalisation',
    completed: 'Terminé',
    failed: 'Échec',
  };

  return translations[status] || status;
};

/**
 * Génère un nom de fichier sécurisé
 */
export const sanitizeFileName = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Télécharge un livre en markdown
 */
export const downloadBook = (bookResult: BookResult): void => {
  const content = bookResult.content;
  const fileName = `${sanitizeFileName(bookResult.title)}.md`;
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Copie le contenu dans le presse-papiers
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    return false;
  }
};

/**
 * Valide les données du formulaire de création de livre
 */
export const validateBookRequest = (title: string, topic: string, goal: string): string[] => {
  const errors: string[] = [];

  if (!title.trim()) {
    errors.push('Le titre est requis');
  } else if (title.trim().length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  }

  if (!topic.trim()) {
    errors.push('Le sujet est requis');
  } else if (topic.trim().length < 5) {
    errors.push('Le sujet doit contenir au moins 5 caractères');
  }

  if (!goal.trim()) {
    errors.push('L\'objectif est requis');
  } else if (goal.trim().length < 10) {
    errors.push('L\'objectif doit contenir au moins 10 caractères');
  }

  return errors;
};

/**
 * Extrait un résumé du contenu
 */
export const extractSummary = (content: string, maxLength: number = 150): string => {
  // Enlève le markdown et garde seulement le texte
  const plainText = content
    .replace(/^#.*$/gm, '') // Enlève les titres
    .replace(/\*\*(.*?)\*\*/g, '$1') // Enlève le gras
    .replace(/\*(.*?)\*/g, '$1') // Enlève l'italique
    .replace(/\n+/g, ' ') // Remplace les retours à la ligne par des espaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
};

/**
 * Détermine la couleur de statut pour l'UI
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-100',
    generating_outline: 'text-blue-600 bg-blue-100',
    writing_chapters: 'text-purple-600 bg-purple-100',
    finalizing: 'text-orange-600 bg-orange-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
  };

  return colors[status] || 'text-gray-600 bg-gray-100';
};

/**
 * Délai d'attente avec Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};