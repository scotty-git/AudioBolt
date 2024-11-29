import React, { useRef, useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { QuestionnaireResponse } from '../../utils/questionnaire/responseStorage';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface SubmissionActionsProps {
  response: QuestionnaireResponse;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SubmissionActions: React.FC<SubmissionActionsProps> = ({
  onView,
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        aria-label="Open actions menu"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn">
          <button
            onClick={() => {
              onView();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Eye size={16} />
            View Submission
          </button>
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Submission
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};