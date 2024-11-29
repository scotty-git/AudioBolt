import React from 'react';
import { Trash2 } from 'lucide-react';
import { Section } from '../../../types/onboarding';
import { QuestionBuilder } from './QuestionBuilder';

interface SectionBuilderProps {
  section: Section;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
}

export const SectionBuilder: React.FC<SectionBuilderProps> = ({
  section,
  onUpdate,
  onDelete,
}) => {
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      type: 'text' as const,
      text: '',
      validation: { required: false },
    };

    onUpdate({
      ...section,
      questions: [...section.questions, newQuestion],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate({ ...section, title: e.target.value })}
            className="w-full text-xl font-semibold text-gray-900 border-0 focus:ring-0 p-0 mb-2"
            placeholder="Section Title"
          />
          <textarea
            value={section.description}
            onChange={(e) => onUpdate({ ...section, description: e.target.value })}
            className="w-full text-gray-600 border-0 focus:ring-0 p-0 resize-none"
            placeholder="Add a description for this section..."
            rows={2}
          />
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete section"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {section.questions.map((question, index) => (
          <QuestionBuilder
            key={question.id}
            question={question}
            onUpdate={(updatedQuestion) =>
              onUpdate({
                ...section,
                questions: section.questions.map((q) =>
                  q.id === question.id ? updatedQuestion : q
                ),
              })
            }
            onDelete={() =>
              onUpdate({
                ...section,
                questions: section.questions.filter((q) => q.id !== question.id),
              })
            }
          />
        ))}

        <button
          onClick={handleAddQuestion}
          className="w-full p-3 border border-gray-200 rounded-md
                   text-gray-600 hover:text-blue-600 hover:border-blue-500
                   transition-colors"
        >
          + Add Question
        </button>
      </div>
    </div>
  );
};