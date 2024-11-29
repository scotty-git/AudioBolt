import React from 'react';
import { QuestionnaireTemplate } from '../../types/questionnaire';

interface JsonPreviewProps {
  data: QuestionnaireTemplate;
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({ data }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">JSON Preview</h3>
      </div>
      <pre className="bg-white p-4 rounded-md overflow-x-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};