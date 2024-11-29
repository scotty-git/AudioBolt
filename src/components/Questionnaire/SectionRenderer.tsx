import React from 'react';
import { QuestionnaireSection } from '../../types/questionnaire';
import { QuestionRenderer } from './QuestionRenderer';

interface SectionRendererProps {
  section: QuestionnaireSection;
  answers: Record<string, string | string[]>;
  onAnswer: (questionId: string, value: string | string[]) => void;
  errors: Record<string, string>;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  answers,
  onAnswer,
  errors,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
        {section.description && (
          <p className="text-gray-600">{section.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {section.questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id] || ''}
            onChange={(value) => onAnswer(question.id, value)}
            error={errors[question.id]}
          />
        ))}
      </div>
    </div>
  );
};