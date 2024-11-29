import React from 'react';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { BaseQuestion } from '../../types/common';

interface QuestionBuilderProps {
  question: BaseQuestion;
  onUpdate: (question: BaseQuestion) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const handleTypeChange = (type: BaseQuestion['type']) => {
    const updatedQuestion = {
      ...question,
      type,
      options: type === 'select' || type === 'radio' || type === 'checkbox'
        ? [{ id: '1', text: 'Option 1', value: 'option1' }]
        : undefined
    };
    onUpdate(updatedQuestion);
  };

  const handleAddOption = () => {
    if (!question.options) return;
    const newOption = {
      id: Date.now().toString(),
      text: `Option ${question.options.length + 1}`,
      value: `option${question.options.length + 1}`
    };
    onUpdate({
      ...question,
      options: [...question.options, newOption]
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={question.text}
            onChange={(e) => onUpdate({ ...question, text: e.target.value })}
            className="w-full text-lg font-medium border-0 focus:ring-0 p-0"
            placeholder="Question text"
          />
          {question.description && (
            <input
              type="text"
              value={question.description}
              onChange={(e) => onUpdate({ ...question, description: e.target.value })}
              className="w-full text-sm text-gray-600 border-0 focus:ring-0 p-0 mt-1"
              placeholder="Question description (optional)"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {onMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Move up"
            >
              <ChevronUp size={20} />
            </button>
          )}
          {onMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Move down"
            >
              <ChevronDown size={20} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Delete question"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <select
            value={question.type}
            onChange={(e) => handleTypeChange(e.target.value as BaseQuestion['type'])}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="text">Short Text</option>
            <option value="long_text">Long Text</option>
            <option value="email">Email</option>
            <option value="select">Dropdown</option>
            <option value="radio">Radio Buttons</option>
            <option value="checkbox">Checkboxes</option>
            <option value="slider">Slider</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={question.validation?.required}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  validation: { ...question.validation, required: e.target.checked }
                })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>
        </div>
      </div>

      {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Options</label>
          {question.options?.map((option, index) => (
            <div key={option.id} className="flex gap-2">
              <input
                type="text"
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...(question.options || [])];
                  newOptions[index] = {
                    ...option,
                    text: e.target.value,
                    value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  };
                  onUpdate({ ...question, options: newOptions });
                }}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder={`Option ${index + 1}`}
              />
              <button
                onClick={() => {
                  const newOptions = question.options?.filter((_, i) => i !== index);
                  onUpdate({ ...question, options: newOptions });
                }}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={18} />
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

      {question.type === 'slider' && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Value
            </label>
            <input
              type="number"
              value={question.validation?.minValue || 0}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  validation: {
                    ...question.validation,
                    minValue: parseInt(e.target.value)
                  }
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Value
            </label>
            <input
              type="number"
              value={question.validation?.maxValue || 10}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  validation: {
                    ...question.validation,
                    maxValue: parseInt(e.target.value)
                  }
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step
            </label>
            <input
              type="number"
              value={question.validation?.step || 1}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  validation: {
                    ...question.validation,
                    step: parseInt(e.target.value)
                  }
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};