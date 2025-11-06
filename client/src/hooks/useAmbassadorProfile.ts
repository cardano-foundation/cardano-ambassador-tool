import { useEffect, useState } from 'react';
import { AmbassadorProfile } from '../types/AmbassadorProfile';

interface UseAmbassadorProfileReturn {
  profile: AmbassadorProfile | null;
  loading: boolean;
  error: string | null;
  refetch: (forceRefresh?: boolean) => void;
  hardRefresh: () => void;
}

export const useAmbassadorProfile = (
  ambassadorUsername: string,
): UseAmbassadorProfileReturn => {
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmbassadorProfile = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(`/api/member/${ambassadorUsername}`, window.location.origin);
      if (forceRefresh) {
        url.searchParams.set('forceRefresh', 'true');
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(
          `Failed to fetch ambassador profile: ${response.status} - ${errorText}`,
        );
      }

      const data: AmbassadorProfile = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const hardRefresh = async () => {
    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          forumProfile: ambassadorUsername 
        }),
      });
      
      await fetchAmbassadorProfile(true);
    } catch (err) {
      console.error('Hard refresh error:', err);
      await fetchAmbassadorProfile(true);
    }
  };

  useEffect(() => {
    if (ambassadorUsername) {
      fetchAmbassadorProfile();
    }
  }, [ambassadorUsername]);

  return {
    profile,
    loading,
    error,
    refetch: fetchAmbassadorProfile,
    hardRefresh,
  };
};
