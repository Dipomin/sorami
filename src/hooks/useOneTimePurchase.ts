import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface OneTimePurchaseOptions {
  offerType?: 'pack-createur';
  amount?: number;
}

interface UseOneTimePurchaseReturn {
  buyPack: (options?: OneTimePurchaseOptions) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour gérer les achats uniques (non-abonnement)
 * Utilisé pour le Pack Créateur et autres offres ponctuelles
 */
export function useOneTimePurchase(): UseOneTimePurchaseReturn {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buyPack = async (options: OneTimePurchaseOptions = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Vous devez être connecté pour effectuer un achat');
      }

      const response = await fetch('/api/payments/one-time/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offerType: options.offerType || 'pack-createur',
          amount: options.amount || 5000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'initialisation du paiement');
      }

      const data = await response.json();

      // Rediriger vers Paystack
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('URL d\'autorisation manquante');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur achat unique:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buyPack,
    isLoading,
    error,
  };
}
