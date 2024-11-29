import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { QuestionnaireResponse } from '../../utils/questionnaireStorage';
import { QuestionnaireTemplate } from '../../types/questionnaire';
import { exportToJson, exportToCsv, downloadBlob } from '../../utils/exportUtils';

interface ExportButtonProps {
  responses: QuestionnaireResponse[];
  templates: QuestionnaireTemplate[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ responses, templates }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = (format: 'json' | 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `submissions-export-${timestamp}.${format}`;
    
    const blob = format === 'json' 
      ? exportToJson(responses, templates)
      : exportToCsv(responses, templates);
    
    downloadBlob(blob, filename);
    setShowOptions(false);
  };

  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Download size={18} />
        Export All
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 animate-fadeIn">
          <div className="py-1">
            <button
              onClick={() => handleExport('json')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Export as CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};