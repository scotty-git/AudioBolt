import React from 'react';
import { Link } from 'react-router-dom';
import { Template } from '../../../db/schema';
import { TemplateList } from './TemplateList';
import { PlusCircle } from 'lucide-react';

interface TemplateSectionProps {
  title: string;
  description: string;
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onSetDefault: (template: Template) => void;
  createNewLink: string;
  createNewText: string;
}

export const TemplateSection: React.FC<TemplateSectionProps> = ({
  title,
  description,
  templates,
  onEdit,
  onDelete,
  onSetDefault,
  createNewLink,
  createNewText,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        <Link
          to={createNewLink}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          <span>{createNewText}</span>
        </Link>
      </div>

      {templates.length > 0 ? (
        <TemplateList
          templates={templates}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No templates found</p>
          <Link
            to={createNewLink}
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
          >
            <PlusCircle size={20} />
            <span>Create your first template</span>
          </Link>
        </div>
      )}
    </div>
  );
};