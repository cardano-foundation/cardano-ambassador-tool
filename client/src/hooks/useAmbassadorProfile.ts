import { useEffect, useState } from 'react';
import { AmbassadorProfile } from '../types/AmbassadorProfile';

interface UseAmbassadorProfileReturn {
  profile: AmbassadorProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAmbassadorProfile = (
  ambassadorId: string,
): UseAmbassadorProfileReturn => {
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmbassadorProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching profile for:', ambassadorId);
      const response = await fetch(`/api/ambassadors/${ambassadorId}`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(
          `Failed to fetch ambassador profile: ${response.status} - ${errorText}`,
        );
      }

      const data: AmbassadorProfile = await response.json();
      console.log('Profile data loaded:', data.name);
      setProfile(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ambassadorId) {
      fetchAmbassadorProfile();
    }
  }, [ambassadorId]);

  return {
    profile,
    loading,
    error,
    refetch: fetchAmbassadorProfile,
  };
};
