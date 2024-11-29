import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CreateNewDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNewDropdown: React.FC<CreateNewDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn"
    >
      <button
        onClick={() => {
          navigate('/onboarding/builder');
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      >
        Create New Onboarding Flow
      </button>
      <button
        onClick={() => {
          navigate('/questionnaires/builder');
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
      >
        Create New Questionnaire
      </button>
    </div>
  );
};