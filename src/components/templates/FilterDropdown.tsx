import React, { useRef } from 'react';
import { Calendar, X } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { cn } from '../../utils/cn';

interface FilterOptions {
  type: 'all' | 'onboarding' | 'questionnaire';
  status: 'all' | 'draft' | 'published' | 'archived';
  dateRange: {
    start?: Date;
    end?: Date;
  };
}

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, onClose);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50 animate-fadeIn"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">Filter Templates</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({
              ...filters,
              type: e.target.value as FilterOptions['type']
            })}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Types</option>
            <option value="onboarding">Onboarding Flows</option>
            <option value="questionnaire">Questionnaires</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({
              ...filters,
              status: e.target.value as FilterOptions['status']
            })}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="date"
                value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => onFilterChange({
                  ...filters,
                  dateRange: {
                    ...filters.dateRange,
                    start: e.target.value ? new Date(e.target.value) : undefined
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex-1">
              <input
                type="date"
                value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => onFilterChange({
                  ...filters,
                  dateRange: {
                    ...filters.dateRange,
                    end: e.target.value ? new Date(e.target.value) : undefined
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};