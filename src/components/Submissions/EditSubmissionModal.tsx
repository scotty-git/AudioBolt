import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { QuestionnaireResponse } from '../../utils/questionnaireStorage';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

interface EditSubmissionModalProps {
  response: QuestionnaireResponse;
  onClose: () => void;
  onSave: (updatedAnswers: Record<string, any>) => void;
}

export const EditSubmissionModal: React.FC<EditSubmissionModalProps> = ({
  response,
  onClose,
  onSave,
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>(response.answers || {});
  const templateData = response.content ? JSON.parse(response.content) : null;
  const sections = templateData?.sections || [];

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    onSave(answers);
    onClose();
  };

  const renderQuestionInput = (question: any, value: any) => {
    switch (question.type) {
      case 'multiple_choice':
      case 'radio':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option</option>
            {question.options?.map((option: any) => (
              <option key={option.id} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option: any) => (
              <label key={option.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
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
                    handleAnswerChange(question.id, newValue);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'long_text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={question.validation?.minValue || 0}
              max={question.validation?.maxValue || 100}
              value={value || 0}
              onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 text-center">
              Current value: {value || 0}
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Submission</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {response.templateTitle || 'Unknown Template'}
              </h3>
              <p className="text-sm text-gray-500">
                Submitted on {formatDate(response.completedAt || '')}
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section: any) => (
                <div key={section.id} className="space-y-6">
                  <h4 className="font-medium text-gray-900 border-b pb-2">
                    {section.title}
                  </h4>
                  {section.questions.map((question: any) => (
                    <div
                      key={question.id}
                      className={cn(
                        "bg-gray-50 rounded-lg p-4 space-y-2",
                        question.validation?.required && "border-l-4 border-blue-500"
                      )}
                    >
                      <label className="block font-medium text-gray-900">
                        {question.text}
                        {question.validation?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {question.description && (
                        <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                      )}
                      {renderQuestionInput(question, answers[question.id])}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};