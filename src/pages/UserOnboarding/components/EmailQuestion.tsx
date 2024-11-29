import React, { useState, useEffect } from 'react';
import { Question } from '../../../types/onboarding';
import { validateEmail } from '../../../utils/validation';
import { cn } from '../../../utils/cn';

interface EmailQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onValidation: (isValid: boolean) => void;
}

export const EmailQuestion: React.FC<EmailQuestionProps> = ({
  question,
  value,
  onChange,
  onValidation,
}) => {
  const [error, setError] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isDirty || value) {
      const { isValid, error } = validateEmail(value);
      setError(error);
      onValidation(isValid);
    }
  }, [value, isDirty, onValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsDirty(true);
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium text-gray-900">
        {question.text}
        {question.validation.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={() => setIsDirty(true)}
        className={cn(
          "w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        )}
        placeholder="Enter your email address"
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
};