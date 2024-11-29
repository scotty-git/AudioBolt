import React from 'react';
import { OnboardingFlow } from '../../../types/onboarding';

interface LivePreviewProps {
  flow: OnboardingFlow;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ flow }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h2>
      
      {flow.sections.map((section) => (
        <div key={section.id} className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{section.title}</h3>
          {section.description && (
            <p className="text-gray-600 mb-4">{section.description}</p>
          )}

          <div className="space-y-6">
            {section.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <label className="block font-medium text-gray-900">
                  {question.text}
                  {question.validation.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {question.type === 'text' && (
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter your answer"
                    disabled
                  />
                )}

                {question.type === 'long_text' && (
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Enter your answer"
                    disabled
                  />
                )}

                {question.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          className="text-blue-600"
                          disabled
                        />
                        <span className="ml-2">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'slider' && (
                  <input
                    type="range"
                    min={question.validation.minValue || 0}
                    max={question.validation.maxValue || 100}
                    className="w-full"
                    disabled
                  />
                )}

                {question.type === 'ranking' && (
                  <div className="space-y-2">
                    {question.options?.map((option, index) => (
                      <div
                        key={option.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg"
                      >
                        <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                          {index + 1}
                        </span>
                        <span className="ml-3">{option.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};