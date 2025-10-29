import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Credits {
  available: number;
  used: number;
  total: number;
  updatedAt: string | null;
}

interface Subscription {
  plan: string;
  creditsPerPeriod: number;
  interval: string;
  currentPeriodEnd: string | null;
  status: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
  metadata: any;
}

interface CreditsData {
  credits: Credits;
  subscription: Subscription | null;
  recentTransactions: CreditTransaction[];
}

export function useCredits() {
  const { getToken } = useAuth();
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch('/api/credits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des crédits');
      }

      const creditsData = await response.json();
      setData(creditsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur useCredits:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const deductCredits = useCallback(
    async (amount: number, description: string, metadata?: any) => {
      try {
        const token = await getToken();
        const response = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ amount, description, metadata }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la déduction des crédits');
        }

        const result = await response.json();
        
        // Rafraîchir les données après déduction
        await fetchCredits();
        
        return result;
      } catch (err) {
        throw err;
      }
    },
    [getToken, fetchCredits]
  );

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    data,
    loading,
    error,
    refetch: fetchCredits,
    deductCredits,
  };
}
