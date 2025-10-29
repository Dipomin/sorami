import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export interface Plan {
  id: string;
  paystackId: string;
  name: string;
  amount: number;
  interval: string;
  currency: string;
  description: string | null;
}

export interface Subscription {
  id: string;
  status: string;
  paystackId: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  plan: {
    id: string;
    name: string;
    amount: number;
    interval: string;
    currency: string;
    description: string | null;
  };
}

export function useSubscription() {
  const { getToken } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setSubscription(null);
        return;
      }

      const response = await fetch('/api/subscriptions/current', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'abonnement');
      }

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      console.error('Erreur fetchSubscription:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const hasActiveSubscription = subscription?.status === 'ACTIVE';

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    hasActiveSubscription,
  };
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/plans');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des plans');
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Erreur fetchPlans:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
}

export function useSubscribe() {
  const { getToken } = useAuth();
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(
    async (planId: string) => {
      try {
        setSubscribing(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error('Non authentifié');
        }

        const response = await fetch('/api/subscriptions/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'initialisation');
        }

        const data = await response.json();

        // Rediriger vers Paystack
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
          return data;
        } else {
          throw new Error('URL d\'autorisation manquante');
        }
      } catch (err) {
        console.error('Erreur subscribe:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        throw err;
      } finally {
        setSubscribing(false);
      }
    },
    [getToken]
  );

  return {
    subscribe,
    subscribing,
    error,
  };
}

export function useCancelSubscription() {
  const { getToken } = useAuth();
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(
    async (subscriptionId: string) => {
      try {
        setCanceling(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error('Non authentifié');
        }

        const response = await fetch('/api/subscriptions/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subscriptionId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'annulation');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Erreur cancel:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        throw err;
      } finally {
        setCanceling(false);
      }
    },
    [getToken]
  );

  return {
    cancel,
    canceling,
    error,
  };
}
