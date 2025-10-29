import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface ProfileStats {
  blogs: number;
  books: number;
  images: number;
  videos: number;
  total: number;
}

interface RecentActivity {
  type: 'blog' | 'book' | 'image' | 'video';
  id: string;
  title: string;
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface Level {
  current: number;
  xp: number;
  nextLevelXP: number;
  totalXP: number;
}

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
}

interface ProfileData {
  stats: ProfileStats;
  recentActivity: RecentActivity[];
  achievements: Achievement[];
  level: Level;
  subscription: Subscription | null;
  memberSince: string;
}

export function useProfile() {
  const { getToken } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch('/api/profile/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement du profil');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Erreur useProfile:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    data,
    loading,
    error,
    refetch: fetchProfile,
  };
}
