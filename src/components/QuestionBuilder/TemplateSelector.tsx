import React from 'react';
import { QuestionnaireTemplate } from '../../types/questionnaire';
import { Trash2 } from 'lucide-react';

interface TemplateSelectorProps {
  templates: QuestionnaireTemplate[];
  activeTemplateId: string | null;
  onSelect: (templateId: string) => void;
  onDelete: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  activeTemplateId,
  onSelect,
  onDelete,
}) => {
  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      <select
        value={activeTemplateId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select a template...</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.title || `Template ${template.id}`}
          </option>
        ))}
      </select>
      
      {activeTemplateId && (
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this template?')) {
              onDelete(activeTemplateId);
            }
          }}
          className="p-2 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50"
          title="Delete template"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
};