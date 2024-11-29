import React from 'react';
import { Search, Filter } from 'lucide-react';

interface TemplateFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
}

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onFilterClick,
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={onFilterClick}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md
                 hover:bg-gray-50 transition-colors"
      >
        <Filter size={20} className="text-gray-500" />
        <span>Filter</span>
      </button>
    </div>
  );
};