import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Question } from '../../types/questionnaire';
import { cn } from '../../utils/cn';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedQuestion: Question) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  onDelete,
  onUpdate,
}) => {
  const handleTypeChange = (type: Question['type']) => {
    const updatedQuestion = { 
      ...question, 
      type,
      options: type === 'multiple-choice' ? ['Option 1'] : undefined 
    };
    onUpdate(question.id, updatedQuestion);
  };

  const handleQuestionTextChange = (text: string) => {
    onUpdate(question.id, { ...question, question: text });
  };

  const handleRequiredChange = (required: boolean) => {
    onUpdate(question.id, { ...question, required });
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdate(question.id, { ...question, options: newOptions });
  };

  const addOption = () => {
    if (!question.options) {
      onUpdate(question.id, { ...question, options: ['New Option'] });
    } else {
      onUpdate(question.id, { 
        ...question, 
        options: [...question.options, `Option ${question.options.length + 1}`] 
      });
    }
  };

  const removeOption = (index: number) => {
    if (!question.options || question.options.length <= 1) return;
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdate(question.id, { ...question, options: newOptions });
  };

  const questionId = `question-${question.id}`;
  const typeId = `type-${question.id}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 flex items-start gap-4">
        <div 
          className="cursor-move text-gray-400 hover:text-gray-600 transition-colors"
          role="button"
          aria-label="Drag to reorder question"
        >
          <GripVertical size={20} />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor={questionId} className="text-sm font-medium text-gray-700">
              Question {questionIndex + 1}
            </label>
            <button
              onClick={() => onDelete(question.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              aria-label="Delete question"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <input
            id={questionId}
            type="text"
            value={question.question}
            onChange={(e) => handleQuestionTextChange(e.target.value)}
            className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter question text"
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor={typeId} className="sr-only">Question type</label>
              <select
                id={typeId}
                value={question.type}
                onChange={(e) => handleTypeChange(e.target.value as Question['type'])}
                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="text">Text Input</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="rating">Rating Scale</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => handleRequiredChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Required</span>
            </label>
          </div>

          {question.type === 'multiple-choice' && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${index + 1}`}
                    aria-label={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="px-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove option ${index + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};