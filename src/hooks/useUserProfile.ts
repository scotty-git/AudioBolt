import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useAuth } from './useAuth';

export interface UserProfile {
  uid: string;
  preferences: {
    genres: string[];
    readingSpeed: 'slow' | 'medium' | 'fast';
  };
  settings: {
    emailNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

const DEFAULT_PROFILE: Omit<UserProfile, 'uid'> = {
  preferences: {
    genres: [],
    readingSpeed: 'medium',
  },
  settings: {
    emailNotifications: true,
    theme: 'system',
    language: 'en',
  },
};

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'userProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          // Create default profile if it doesn't exist
          const defaultProfile = {
            uid: user.uid,
            ...DEFAULT_PROFILE,
          };
          await setDoc(profileRef, defaultProfile);
          setProfile(defaultProfile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'uid'>>) => {
    if (!user || !profile) return;

    try {
      const profileRef = doc(db, 'userProfiles', user.uid);
      await updateDoc(profileRef, updates);
      setProfile({ ...profile, ...updates });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
};
