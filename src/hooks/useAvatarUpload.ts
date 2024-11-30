import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase/config';

export const useAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // Create a reference to the file location
      const avatarRef = ref(storage, `avatars/${userId}/${file.name}`);

      // Upload the file
      const snapshot = await uploadBytes(avatarRef, file);
      console.log('[Storage] Avatar uploaded successfully');

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (err) {
      console.error('[Storage] Avatar upload failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadAvatar,
    uploading,
    error,
  };
};
