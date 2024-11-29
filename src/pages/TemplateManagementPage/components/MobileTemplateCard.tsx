import React from 'react';
import { Template } from '../../../db/schema';
import { TemplateActions } from './TemplateActions';
import { Star } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

interface MobileTemplateCardProps {
  template: Template;
  onSetDefault: (template: Template) => void;
  onDelete: (template: Template) => void;
}

export const MobileTemplateCard: React.FC<MobileTemplateCardProps> = ({
  template,
  onSetDefault,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {template.is_default && (
            <Star className="w-4 h-4 text-yellow-400" />
          )}
          <h3 className="font-medium text-gray-900">{template.title}</h3>
        </div>
        <TemplateActions
          template={template}
          onSetDefault={onSetDefault}
          onDelete={onDelete}
        />
      </div>
      
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Type:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                         bg-blue-100 text-blue-800 capitalize">
            {template.type}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Created:</span>
          <span className="text-gray-900">{formatDate(template.created_at)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Last Modified:</span>
          <span className="text-gray-900">{formatDate(template.updated_at)}</span>
        </div>
      </div>
    </div>
  );
};