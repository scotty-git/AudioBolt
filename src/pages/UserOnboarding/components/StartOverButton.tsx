import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { clearOnboardingData } from '../../../utils/validation';
import { ConfirmationModal } from '../../../components/modals/ConfirmationModal';

export const StartOverButton: React.FC = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleStartOver = () => {
    const clearedItems = clearOnboardingData();
    console.log(`Cleared ${clearedItems} onboarding-related items`);
    window.location.reload();
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <RotateCcw size={18} />
        <span>Start Over</span>
      </button>

      {showConfirmation && (
        <ConfirmationModal
          title="Start Over?"
          message="This will clear all your progress and responses. This action cannot be undone."
          confirmText="Start Over"
          onConfirm={handleStartOver}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
};