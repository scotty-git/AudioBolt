import React from 'react';
import { SearchX } from 'lucide-react';

export const NoResults: React.FC = () => {
  return (
    <div className="text-center py-12">
      <SearchX className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No Results Found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your search or filter criteria
      </p>
    </div>
  );
};