import React from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AutosaveIndicatorProps {
  status: 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  className?: string;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  status,
  lastSaved,
  className
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        status === 'error' ? "text-red-600" : "text-gray-600",
        className
      )}
    >
      {status === 'saving' ? (
        <>
          <RefreshCw size={16} className="animate-spin" />
          <span>Saving...</span>
        </>
      ) : status === 'saved' ? (
        <>
          <Check size={16} className="text-green-600" />
          <span>
            Saved {lastSaved && `at ${lastSaved.toLocaleTimeString()}`}
          </span>
        </>
      ) : (
        <>
          <AlertCircle size={16} />
          <span>Save failed</span>
        </>
      )}
    </div>
  );
};