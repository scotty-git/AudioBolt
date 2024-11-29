import React from 'react';
import { Section, Response } from '../../../types/onboarding';
import { QuestionRenderer } from '../../../components/Questionnaire/QuestionRenderer';

interface OnboardingSectionProps {
  section: Section;
  responses: Record<string, Response>;
  onResponse: (questionId: string, value: any) => void;
}

export const OnboardingSection: React.FC<OnboardingSectionProps> = ({
  section,
  responses,
  onResponse,
}) => {
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {section.title}
        </h2>
        {section.description && (
          <p className="text-gray-600">{section.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {section.questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={{
              ...question,
              type: question.type === 'number' ? 'text' : question.type,
              placeholder: question.placeholder || 'Type your answer here...'
            }}
            value={responses[question.id]?.value || ''}
            onChange={(value) => onResponse(question.id, value)}
          />
        ))}
      </div>
    </div>
  );
};