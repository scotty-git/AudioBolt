import React from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { DateRangePicker } from '../common/DateRangePicker';

interface DateRange {
  start?: Date;
  end?: Date;
}

interface SubmissionsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  templateType: 'all' | 'onboarding' | 'questionnaire';
  onTemplateTypeChange: (type: 'all' | 'onboarding' | 'questionnaire') => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const SubmissionsFilters: React.FC<SubmissionsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  templateType,
  onTemplateTypeChange,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by template name or date..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors
            ${showFilters 
              ? 'border-blue-500 text-blue-600 bg-blue-50' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Type
              </label>
              <select
                value={templateType}
                onChange={(e) => onTemplateTypeChange(e.target.value as 'all' | 'onboarding' | 'questionnaire')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="onboarding">Onboarding</option>
                <option value="questionnaire">Questionnaire</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Date Range
              </label>
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={onDateRangeChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};