import { useEffect, useState } from 'react';
import { AmbassadorProfile } from '../types/AmbassadorProfile';

interface UseAmbassadorProfileReturn {
  profile: AmbassadorProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAmbassadorProfile = (
  ambassadorUsername: string,
): UseAmbassadorProfileReturn => {
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmbassadorProfile = async () => {
    try {
      setLoading(true);
      setError(null);

            const response = await fetch(`/api/member/${ambassadorUsername}`);
      
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
  };
};
