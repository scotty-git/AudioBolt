import React from 'react';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { Section } from '../../types/common';
import { QuestionBuilder } from './QuestionBuilder';

interface SectionBuilderProps {
  section: Section;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SectionBuilder: React.FC<SectionBuilderProps> = ({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      type: 'text',
      text: 'New Question',
      validation: { required: false }
    };

    onUpdate({
      ...section,
      questions: [...section.questions, newQuestion]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <GripVertical className="text-gray-400 cursor-move" size={20} />
            <input
              type="text"
              value={section.title}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
              className="text-xl font-semibold text-gray-900 border-0 focus:ring-0 p-0 w-full"
              placeholder="Section Title"
            />
          </div>
          <textarea
            value={section.description}
            onChange={(e) => onUpdate({ ...section, description: e.target.value })}
            className="w-full text-gray-600 border-0 focus:ring-0 p-0 resize-none"
            placeholder="Add a description for this section..."
            rows={2}
          />
        </div>
        <div className="flex items-center gap-2">
          {onMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Move section up"
            >
              ↑
            </button>
          )}
          {onMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Move section down"
            >
              ↓
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500"
            title="Delete section"
          >
            <Trash2 size={20} />
          </button>
        </div>
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
            onMoveUp={index > 0 ? () => {
              const newQuestions = [...section.questions];
              [newQuestions[index], newQuestions[index - 1]] = 
              [newQuestions[index - 1], newQuestions[index]];
              onUpdate({ ...section, questions: newQuestions });
            } : undefined}
            onMoveDown={index < section.questions.length - 1 ? () => {
              const newQuestions = [...section.questions];
              [newQuestions[index], newQuestions[index + 1]] = 
              [newQuestions[index + 1], newQuestions[index]];
              onUpdate({ ...section, questions: newQuestions });
            } : undefined}
          />
        ))}

        <button
          onClick={handleAddQuestion}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg
                   flex items-center justify-center gap-2 text-gray-600
                   hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <PlusCircle size={20} />
          <span>Add Question</span>
        </button>
      </div>
    </div>
  );
};