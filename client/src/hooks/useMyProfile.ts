import { useEffect, useState } from 'react';
import { MyProfileData, ProfileStats, ConnectedWallet } from '@/types/Profile';

interface UseMyProfileReturn {
  profile: MyProfileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateProfile: (data: Partial<MyProfileData>) => Promise<void>;
}

const mockProfile: MyProfileData = {
  id: 'benjamin-baani',
  name: 'Preston Odep',
  displayName: 'Pres',
  email: 'preston@odep.co.ke',
  bio: 'I am Benjamin Baani from Ghana. I am a Blockchain Enthusiast, Cardano Events Organizer and Speaker. In Project Catalyst, I have served as a Proposal Assessor, Veteran Proposal Assessor, Challenge Team Member from Fund 8 to Fund 9, Voter, Team Lead for Startups & Onboarding for Students Challenge Team in Fund 10, Group E Proof of Life (PoL) Verifiers Team Lead in Fund 11. I am an agent of scaling up Cardano adoption in Ghana.',
  country: 'Ghana',
  countryCode: 'GH',
  wallet: 'Addr76crtw...fedc5c',
  ambassadorUrl: 'https://ambassadorexplorer.com/preston',
  spoId: 'f19ea9897e67ighlff70080...0dbc5c',
  github: 'Benjamin Baani',
  twitter: 'Benjamin Baani', 
  discord: 'Benjamin Baani',
  avatar: '',
  stats: {
    topicsCreated: 30,
    given: 45,
    received: 74,
    daysVisited: 281,
    postsCreated: 65,
  },
  connectedWallet: {
    address: '68429...3425',
    balance: 'Disconnect'
  },
  isActiveAmbassador: true
};

// Development mode flag - toggle this easily
const USE_MOCK_DATA = true;

export const useMyProfile = (): UseMyProfileReturn => {
  const [profile, setProfile] = useState<MyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProfile = async () => {
    if (USE_MOCK_DATA) {
      // Simulate loading delay
      setLoading(true);
      setTimeout(() => {
        setProfile(mockProfile);
        setLoading(false);
              }, 1000);
      return;
    }

    // Real API call (for when authentication is ready)
    try {
      setLoading(true);
      setError(null);

            const response = await fetch('/api/profile/me');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch profile: ${response.status} - ${errorText}`);
      }

      const data: MyProfileData = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData: Partial<MyProfileData>) => {
    if (USE_MOCK_DATA) {
      // Simulate update with mock data
            setProfile(prev => prev ? { ...prev, ...updateData } : null);
      return;
    }

    // Real API update call
    try {
      setError(null);
      
      const response = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchMyProfile,
    updateProfile,
  };
};