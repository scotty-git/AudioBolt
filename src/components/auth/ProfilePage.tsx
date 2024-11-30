import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { AuthErrorDisplay } from './AuthErrorDisplay';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import { updatePassword } from 'firebase/auth';
import { auth } from '../../lib/firebase/config';

const GENRES = [
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'sci-fi', label: 'Science Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'horror', label: 'Horror' },
  { value: 'biography', label: 'Biography' },
  { value: 'history', label: 'History' },
];

const READING_SPEEDS = [
  { value: 'slow', label: 'Slow' },
  { value: 'medium', label: 'Medium' },
  { value: 'fast', label: 'Fast' },
];

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Profile</h3>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete your profile? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateEmail } = useAuth();
  const { profile, loading, error: profileError, updateProfile, deleteProfile } = useUserProfile();
  const { uploadAvatar, uploading: uploadingAvatar, error: avatarError } = useAvatarUpload();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [readingSpeed, setReadingSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('en');

  // Update local state when profile is loaded
  useEffect(() => {
    if (!loading && profile) {
      setSelectedGenres(profile.preferences?.genres || []);
      setReadingSpeed(profile.preferences?.readingSpeed || 'medium');
      setEmailNotifications(profile.settings?.emailNotifications ?? true);
      setTheme(profile.settings?.theme || 'system');
      setLanguage(profile.settings?.language || 'en');
    }
  }, [profile, loading]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const downloadURL = await uploadAvatar(file, user.uid);
      if (downloadURL) {
        await updateProfile({
          ...profile,
          avatarUrl: downloadURL,
        });
        setSuccess('Avatar updated successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await updatePassword(user, newPassword);
      setSuccess('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  const handleUpdateProfile = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Update email if changed
      if (email !== user?.email) {
        await updateEmail(email);
      }

      // Update profile
      await updateProfile({
        preferences: {
          genres: selectedGenres,
          readingSpeed,
        },
        settings: {
          emailNotifications,
          theme,
          language,
        },
      });

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteProfile();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Avatar Section */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
          <div className="flex items-center space-x-4">
            <img
              src={profile?.avatarUrl || 'https://via.placeholder.com/100'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Uploading...' : 'Change Picture'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Account Section */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="pt-4 border-t">
              <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>
              <div className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button onClick={handlePasswordChange}>
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <Select
              label="Favorite Genres"
              options={GENRES}
              value={selectedGenres}
              onChange={setSelectedGenres}
              multiple
            />
            <Select
              label="Reading Speed"
              options={READING_SPEEDS}
              value={readingSpeed}
              onChange={setReadingSpeed}
            />
          </div>
        </Card>

        {/* Settings Section */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Email Notifications</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 text-indigo-600"
              />
            </div>
            <Select
              label="Theme"
              options={THEMES}
              value={theme}
              onChange={setTheme}
            />
            <Select
              label="Language"
              options={LANGUAGES}
              value={language}
              onChange={setLanguage}
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleUpdateProfile}
            disabled={isLoading}
            className="w-32"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
            className="w-32"
          >
            Delete Profile
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && <AuthErrorDisplay error={error} />}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={handleDeleteProfile}
          onCancel={() => setShowDeleteModal(false)}
        />
      </div>
    </div>
  );
};
