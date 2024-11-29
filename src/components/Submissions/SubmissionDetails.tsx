import React from 'react';
import { ArrowLeft, Download, X } from 'lucide-react';
import { QuestionnaireResponse } from '../../utils/questionnaire/responseStorage';
import { formatDate } from '../../utils/dateUtils';

interface SubmissionDetailsProps {
  response: QuestionnaireResponse;
  onClose: () => void;
}

export const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({
  response,
  onClose,
}) => {
  const handleExport = () => {
    const exportData = {
      templateTitle: response.templateTitle,
      submittedAt: response.completedAt,
      answers: response.answers,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission-${response.templateId}-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse the template content to get sections and questions
  const templateData = response.content ? JSON.parse(response.content) : null;
  const sections = templateData?.sections || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Submission Details</h2>
          </div>
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
                {response.templateTitle}
              </h3>
              <p className="text-sm text-gray-500">
                Submitted on {formatDate(response.completedAt || '')}
              </p>
            </div>

            <div className="space-y-6">
              {sections.map((section: any) => (
                <div key={section.id} className="space-y-4">
                  <h4 className="font-medium text-gray-900">{section.title}</h4>
                  {section.questions.map((question: any) => {
                    const answer = response.answers[question.id];
                    return (
                      <div
                        key={question.id}
                        className="bg-gray-50 rounded-lg p-4 space-y-2"
                      >
                        <p className="font-medium text-gray-900">{question.text}</p>
                        <p className="text-gray-700">
                          {Array.isArray(answer)
                            ? answer.join(', ')
                            : answer || 'Not answered'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ))}
              {sections.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No questions found in this template
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Export as JSON
          </button>
        </div>
      </div>
    </div>
  );
};