import React from 'react';
import { Question } from '../../../../types/onboarding';
import { cn } from '../../../../utils/cn';

interface MultipleChoiceQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  if (!question.options?.length) return null;

  return (
    <div className="space-y-3" role="radiogroup" aria-label={question.text}>
      {question.options.map((option) => (
        <label
          key={option.id}
          className={cn(
            "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
            value === option.value
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:bg-gray-50"
          )}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            aria-label={option.text}
            data-testid={`option-${option.id}`}
          />
          <span className="ml-3">{option.text}</span>
        </label>
      ))}
    </div>
  );
};