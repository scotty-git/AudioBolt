import React from 'react';
import { Template } from '../../../db/schema';
import { FileText, CheckCircle, Archive } from 'lucide-react';

interface TemplateStatsProps {
  templates: Template[];
}

export const TemplateStats: React.FC<TemplateStatsProps> = ({ templates }) => {
  const stats = {
    total: templates.length,
    published: templates.filter(t => t.status === 'published').length,
    draft: templates.filter(t => t.status === 'draft').length,
    archived: templates.filter(t => t.status === 'archived').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total Templates</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <FileText className="text-blue-600" size={24} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-semibold text-green-600">{stats.published}</p>
        </div>
        <CheckCircle className="text-green-600" size={24} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Drafts</p>
          <p className="text-2xl font-semibold text-gray-600">{stats.draft}</p>
        </div>
        <FileText className="text-gray-600" size={24} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Archived</p>
          <p className="text-2xl font-semibold text-gray-500">{stats.archived}</p>
        </div>
        <Archive className="text-gray-500" size={24} />
      </div>
    </div>
  );
};