import React from 'react';
import { Question } from '../../types/questionnaire';
import { cn } from '../../utils/cn';

interface QuestionRendererProps {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  const handleChange = (newValue: string | string[]) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <label className="block text-lg font-medium text-gray-900">
          {question.text}
          {question.validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {question.description && (
        <p className="text-sm text-gray-600">{question.description}</p>
      )}

      {(question.type === 'text' || question.type === 'email') && (
        <input
          type={question.type}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={question.placeholder}
          className={cn(
            "w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          )}
        />
      )}

      {(question.type === 'long_text' || question.type === 'textarea') && (
        <textarea
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={question.placeholder}
          className={cn(
            "w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[120px]",
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          )}
          rows={5}
        />
      )}

      {question.type === 'select' && question.options && (
        <select
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            "w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          )}
        >
          <option value="">Select an option</option>
          {question.options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      )}

      {(question.type === 'radio' || question.type === 'multiple_choice') && question.options && (
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                value === option.value 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => handleChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3">{option.text}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'checkbox' && question.options && (
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                Array.isArray(value) && value.includes(option.value)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <input
                type="checkbox"
                value={option.value}
                checked={Array.isArray(value) && value.includes(option.value)}
                onChange={(e) => {
                  const newValue = Array.isArray(value) ? [...value] : [];
                  if (e.target.checked) {
                    newValue.push(option.value);
                  } else {
                    const index = newValue.indexOf(option.value);
                    if (index > -1) {
                      newValue.splice(index, 1);
                    }
                  }
                  handleChange(newValue);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3">{option.text}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'slider' && (
        <div className="space-y-4">
          <input
            type="range"
            min={question.validation?.minValue || 0}
            max={question.validation?.maxValue || 100}
            step={question.validation?.step || 1}
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{question.validation?.minValue || 0}</span>
            <span>Selected: {value}</span>
            <span>{question.validation?.maxValue || 100}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
};