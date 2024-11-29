import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  itemCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  itemCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-fadeIn">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete {itemCount} selected {itemCount === 1 ? 'item' : 'items'}? 
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete {itemCount === 1 ? 'Item' : 'Items'}
          </button>
        </div>
      </div>
    </div>
  );
};