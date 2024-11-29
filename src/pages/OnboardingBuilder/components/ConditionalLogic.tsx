import React from 'react';
import { ConditionalLogic as ConditionalLogicType, Question } from '../../../types/onboarding';

interface ConditionalLogicProps {
  logic: ConditionalLogicType | undefined;
  onChange: (logic: ConditionalLogicType | undefined) => void;
  availableQuestions: Question[];
}

export const ConditionalLogic: React.FC<ConditionalLogicProps> = React.memo(({
  logic,
  onChange,
  availableQuestions,
}) => {
  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
  ];

  const handleChange = (field: keyof ConditionalLogicType, value: any) => {
    if (!logic) {
      onChange({
        questionId: '',
        operator: 'equals',
        value: '',
        ...{ [field]: value },
      });
    } else {
      onChange({
        ...logic,
        [field]: value,
      });
    }
  };

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
      <h4 className="font-medium text-gray-900">Conditional Logic</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Based on Question</label>
          <select
            value={logic?.questionId || ''}
            onChange={(e) => handleChange('questionId', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a question</option>
            {availableQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.text}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Operator</label>
          <select
            value={logic?.operator || 'equals'}
            onChange={(e) => handleChange('operator', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {operators.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Value</label>
          <input
            type="text"
            value={logic?.value || ''}
            onChange={(e) => handleChange('value', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter value"
          />
        </div>
      </div>
    </div>
  );
});

ConditionalLogic.displayName = 'ConditionalLogic';