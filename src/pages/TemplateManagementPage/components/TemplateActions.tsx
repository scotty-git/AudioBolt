import React, { useRef, useState } from 'react';
import { MoreVertical, ExternalLink, Edit, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Template } from '../../../db/schema';
import { useOnClickOutside } from '../../../hooks/useOnClickOutside';

interface TemplateActionsProps {
  template: Template;
  onSetDefault: (template: Template) => void;
  onDelete: (template: Template) => void;
}

export const TemplateActions: React.FC<TemplateActionsProps> = ({
  template,
  onSetDefault,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const handleOpen = () => {
    const path = template.type === 'onboarding' 
      ? `/onboarding/view/${template.id}`
      : `/questionnaires/view/${template.id}`;
    navigate(path);
    setIsOpen(false);
  };

  const handleEdit = () => {
    const path = template.type === 'onboarding'
      ? `/onboarding/builder/${template.id}`
      : `/questionnaires/builder/${template.id}`;
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn">
          <button
            onClick={handleOpen}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Open
          </button>
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </button>
          {!template.is_default && (
            <button
              onClick={() => {
                onSetDefault(template);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Star size={16} />
              Set as Default
            </button>
          )}
          <button
            onClick={() => {
              onDelete(template);
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