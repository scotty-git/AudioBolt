import React, { useState } from 'react';
import { FileText, AlertCircle, HelpCircle } from 'lucide-react';
import { QuestionnaireTemplate } from '../../types/questionnaire';
import { validateTemplate } from '../../utils/validation';

interface JsonImportProps {
  onImport: (template: QuestionnaireTemplate) => void;
}

export const JsonImport: React.FC<JsonImportProps> = ({ onImport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const validationResult = validateTemplate(parsedJson);

      if (!validationResult.success) {
        setError('Invalid template format. Please check the documentation and try again.');
        return;
      }

      onImport(parsedJson);
      setJsonInput('');
      setError(null);
      setIsOpen(false);
    } catch (e) {
      setError('Invalid JSON format. Please check your input and try again.');
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="text-gray-500" size={20} />
          <h3 className="text-lg font-medium text-gray-900">Import Template</h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <HelpCircle size={16} />
            Documentation
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isOpen ? 'Cancel' : 'Import from JSON'}
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Template Documentation</h4>
          <p className="text-blue-800 mb-2">
            For detailed instructions on creating templates, please refer to:
          </p>
          <a
            href="/docs/TEMPLATE_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Template Guide Documentation
          </a>
        </div>
      )}

      {isOpen && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your JSON template here:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste your JSON template here..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Import Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};