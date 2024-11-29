import React from 'react';
import { Question, Response } from '../../../types/onboarding';
import { cn } from '../../../utils/cn';
import { shouldShowQuestion } from '../../../utils/conditionalLogic';
import { TextQuestion } from './questions/TextQuestion';
import { MultipleChoiceQuestion } from './questions/MultipleChoiceQuestion';
import { SliderQuestion } from './questions/SliderQuestion';
import { RankingQuestion } from './questions/RankingQuestion';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  responses: Record<string, Response>;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  responses,
}) => {
  if (!shouldShowQuestion(question, responses)) {
    return null;
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'text':
      case 'long_text':
        return (
          <TextQuestion
            question={question}
            value={value || ''}
            onChange={onChange}
          />
        );
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            question={question}
            value={value || ''}
            onChange={onChange}
          />
        );
      case 'slider':
        return (
          <SliderQuestion
            question={question}
            value={value || 0}
            onChange={onChange}
          />
        );
      case 'ranking':
        return (
          <RankingQuestion
            question={question}
            value={value || []}
            onChange={onChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4" data-testid={`question-${question.id}`}>
      <div className="flex items-start justify-between">
        <label className="block text-lg font-medium text-gray-900" htmlFor={`question-${question.id}`}>
          {question.text}
          {question.validation.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      </div>
      {question.description && (
        <p className="text-sm text-gray-600">{question.description}</p>
      )}
      {renderQuestion()}
    </div>
  );
};