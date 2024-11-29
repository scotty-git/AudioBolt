import React from 'react';

interface NavigationProps {
  currentIndex: number;
  totalSections: number;
  canProceed: boolean;
  isOptional: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentIndex,
  totalSections,
  canProceed,
  isOptional,
  onNext,
  onBack,
  onSkip,
}) => {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onBack}
        disabled={currentIndex === 0}
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md
                 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors"
      >
        Back
      </button>
      
      <div className="flex items-center gap-4">
        {isOptional && (
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Skip
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-4 py-2 bg-blue-600 text-white rounded-md
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          {currentIndex === totalSections - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};