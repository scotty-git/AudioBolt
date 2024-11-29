import React from 'react';
import { Question } from '../../../../types/onboarding';
import { cn } from '../../../../utils/cn';

interface TextQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  const isLongText = question.type === 'long_text';

  return (
    <div className="space-y-2">
      {isLongText ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
            "min-h-[120px] resize-y"
          )}
          placeholder="Type your answer here..."
          aria-label={question.text}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Type your answer here..."
          aria-label={question.text}
        />
      )}
    </div>
  );
};