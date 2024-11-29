import React from 'react';
import { Question } from '../../../../types/onboarding';
import { ValidationRules } from '../ValidationRules';

interface TextQuestionProps {
  question: Question;
  onUpdate: (question: Question) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = React.memo(({ question, onUpdate }) => {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={question.text}
        onChange={(e) => onUpdate({ ...question, text: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Enter question text"
      />
      <ValidationRules
        validation={question.validation}
        onChange={(validation) => onUpdate({ ...question, validation })}
        type="text"
      />
    </div>
  );
});

TextQuestion.displayName = 'TextQuestion';