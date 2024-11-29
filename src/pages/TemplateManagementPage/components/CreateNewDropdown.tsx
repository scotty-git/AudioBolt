import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody,
  useDisclosure,
  Button
} from '@chakra-ui/react';
import { TemplateCreationForm } from '../../../components/forms/TemplateCreationForm';

interface CreateNewDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNewDropdown: React.FC<CreateNewDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    isOpen: isTemplateModalOpen, 
    onOpen: onTemplateModalOpen, 
    onClose: onTemplateModalClose 
  } = useDisclosure();

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

  const handleCreateTemplate = () => {
    onClose(); // Close dropdown
    onTemplateModalOpen(); // Open template creation modal
  };

  if (!isOpen) return null;

  return (
    <>
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
        <button
          onClick={handleCreateTemplate}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Create New Template
        </button>
      </div>

      <Modal 
        isOpen={isTemplateModalOpen} 
        onClose={onTemplateModalClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TemplateCreationForm 
              onSuccess={onTemplateModalClose} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};