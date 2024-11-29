import React from 'react';
import { FileText, Plus, ChevronDown } from 'lucide-react';

interface TemplateHeaderProps {
  onCreateNew: () => void;
}

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({ onCreateNew }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <FileText className="text-blue-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Template Management
          </h1>
          <p className="text-gray-600">
            Manage your onboarding flows and questionnaires
          </p>
        </div>
      </div>
      
      <button
        onClick={onCreateNew}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md 
                 hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        <span>Create New</span>
        <ChevronDown size={16} />
      </button>
    </div>
  );
};