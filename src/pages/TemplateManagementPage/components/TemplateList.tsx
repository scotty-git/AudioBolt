import React from 'react';
import { Template } from '../../../db/schema';
import { formatDate } from '../../../utils/dateUtils';
import { Edit2, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onSetDefault: (template: Template) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onEdit,
  onDelete,
  onSetDefault,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Modified
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {template.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {template.is_default && (
                      <Star className="w-4 h-4 text-yellow-400 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {template.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500 capitalize">
                    {template.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {formatDate(template.created_at)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {formatDate(template.updated_at)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(template)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit template"
                    >
                      <Edit2 size={18} />
                    </button>
                    {!template.is_default && (
                      <>
                        <button
                          onClick={() => onSetDefault(template)}
                          className="p-1 text-yellow-600 hover:text-yellow-800"
                          title="Set as default"
                        >
                          <Star size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(template)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete template"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "p-2 text-gray-600 hover:text-gray-900",
              currentPage === 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "p-2 text-gray-600 hover:text-gray-900",
              currentPage === totalPages && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};