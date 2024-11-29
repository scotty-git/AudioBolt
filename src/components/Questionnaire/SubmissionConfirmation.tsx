import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SubmissionConfirmationProps {
  onClose: () => void;
}

export const SubmissionConfirmation: React.FC<SubmissionConfirmationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-fadeIn">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Submission Successful!
          </h2>
          <p className="mt-2 text-gray-600">
            Your responses have been saved successfully. Thank you for completing the questionnaire.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};