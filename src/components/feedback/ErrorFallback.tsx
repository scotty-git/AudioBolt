import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="p-6 bg-red-50 rounded-lg">
      <div className="flex items-center gap-3 text-red-600 mb-4">
        <AlertTriangle size={24} />
        <h3 className="text-lg font-semibold">Something went wrong</h3>
      </div>
      <p className="text-red-700 mb-4">{error.message}</p>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
};