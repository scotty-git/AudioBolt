import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ValidationMessageProps {
  message: string;
  type: 'error' | 'success';
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  message,
  type,
  className
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm mt-1",
        type === 'error' ? "text-red-600" : "text-green-600",
        className
      )}
    >
      {type === 'error' ? (
        <AlertCircle size={16} />
      ) : (
        <CheckCircle size={16} />
      )}
      <span>{message}</span>
    </div>
  );
};