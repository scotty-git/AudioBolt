import React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MultiSelectActionsProps {
  selectedIds: string[];
  onDelete: () => void;
  className?: string;
}

export const MultiSelectActions: React.FC<MultiSelectActionsProps> = ({
  selectedIds,
  onDelete,
  className
}) => {
  if (selectedIds.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 py-2", className)}>
      <span className="text-sm text-gray-600">
        {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
      </span>
      <button
        onClick={onDelete}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 
                 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
      >
        <Trash2 size={16} />
        Delete Selected
      </button>
    </div>
  );
};