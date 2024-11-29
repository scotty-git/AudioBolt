import React from 'react';
import { ValidationRules as ValidationRulesType } from '../../../types/onboarding';

interface ValidationRulesProps {
  validation: ValidationRulesType;
  onChange: (validation: ValidationRulesType) => void;
  type: 'text' | 'long_text' | 'multiple_choice' | 'slider' | 'ranking';
}

export const ValidationRules: React.FC<ValidationRulesProps> = React.memo(({
  validation,
  onChange,
  type,
}) => {
  const handleChange = (field: keyof ValidationRulesType, value: any) => {
    onChange({
      ...validation,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={validation.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Required</span>
        </label>

        {(type === 'text' || type === 'long_text') && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Min Length:</label>
              <input
                type="number"
                value={validation.minLength || ''}
                onChange={(e) => handleChange('minLength', parseInt(e.target.value) || undefined)}
                className="w-20 p-1 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Max Length:</label>
              <input
                type="number"
                value={validation.maxLength || ''}
                onChange={(e) => handleChange('maxLength', parseInt(e.target.value) || undefined)}
                className="w-20 p-1 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        {type === 'slider' && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Min Value:</label>
              <input
                type="number"
                value={validation.minValue || ''}
                onChange={(e) => handleChange('minValue', parseInt(e.target.value) || undefined)}
                className="w-20 p-1 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Max Value:</label>
              <input
                type="number"
                value={validation.maxValue || ''}
                onChange={(e) => handleChange('maxValue', parseInt(e.target.value) || undefined)}
                className="w-20 p-1 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
});

ValidationRules.displayName = 'ValidationRules';