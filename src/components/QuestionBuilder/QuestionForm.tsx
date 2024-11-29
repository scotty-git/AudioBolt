import React from 'react';
import { Question } from '../../types/questionnaire';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface QuestionFormProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onRemove: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onUpdate,
  onRemove,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleTypeChange = (type: Question['type']) => {
    onUpdate({
      ...question,
      type,
      options: type === 'multiple-choice' ? [''] : undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <h3 className="font-medium">Question {question.id}</h3>
        </div>
        <button
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => onUpdate({ ...question, question: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your question"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type
              </label>
              <select
                value={question.type}
                onChange={(e) => handleTypeChange(e.target.value as Question['type'])}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="text">Text Input</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="rating">Rating Scale</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
            </div>
          </div>

          {question.type === 'multiple-choice' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Options</label>
              {question.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
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
                    className="px-3 py-2 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  onUpdate({ ...question, options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};