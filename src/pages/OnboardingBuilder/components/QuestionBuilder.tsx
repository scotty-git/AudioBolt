import React from 'react';
import { Trash2 } from 'lucide-react';
import { Question, QuestionType } from '../../../types/onboarding';

interface QuestionBuilderProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
}

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'slider', label: 'Slider' },
  { value: 'ranking', label: 'Ranking' },
];

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  question,
  onUpdate,
  onDelete,
}) => {
  const handleAddOption = () => {
    const newOption = {
      id: `option-${Date.now()}`,
      text: `Option ${(question.options?.length || 0) + 1}`,
      value: `option-${(question.options?.length || 0) + 1}`,
    };

    onUpdate({
      ...question,
      options: [...(question.options || []), newOption],
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex gap-4 mb-4">
        <select
          value={question.type}
          onChange={(e) => onUpdate({ ...question, type: e.target.value as QuestionType })}
          className="flex-1 p-2 border border-gray-300 rounded-md"
        >
          {questionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <input
        type="text"
        value={question.text}
        onChange={(e) => onUpdate({ ...question, text: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
        placeholder="Enter question text"
      />

      <div className="space-y-4">
        {/* Validation Rules */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={question.validation.required}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  validation: { ...question.validation, required: e.target.checked },
                })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>

          {(question.type === 'text' || question.type === 'long_text') && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Min Length:</label>
                <input
                  type="number"
                  value={question.validation.minLength || ''}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      validation: {
                        ...question.validation,
                        minLength: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  className="w-20 p-1 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Max Length:</label>
                <input
                  type="number"
                  value={question.validation.maxLength || ''}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      validation: {
                        ...question.validation,
                        maxLength: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  className="w-20 p-1 border border-gray-300 rounded-md"
                />
              </div>
            </>
          )}

          {question.type === 'slider' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Min Value:</label>
                <input
                  type="number"
                  value={question.validation.minValue || ''}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      validation: {
                        ...question.validation,
                        minValue: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  className="w-20 p-1 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Max Value:</label>
                <input
                  type="number"
                  value={question.validation.maxValue || ''}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      validation: {
                        ...question.validation,
                        maxValue: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  className="w-20 p-1 border border-gray-300 rounded-md"
                />
              </div>
            </>
          )}
        </div>

        {/* Options for multiple choice and ranking questions */}
        {(question.type === 'multiple_choice' || question.type === 'ranking') && (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={option.id} className="flex gap-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      options: question.options?.map((opt) =>
                        opt.id === option.id
                          ? { ...opt, text: e.target.value, value: e.target.value.toLowerCase() }
                          : opt
                      ),
                    })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() =>
                    onUpdate({
                      ...question,
                      options: question.options?.filter((opt) => opt.id !== option.id),
                    })
                  }
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddOption}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Option
            </button>
          </div>
        )}
      </div>
    </div>
  );
};