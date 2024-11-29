import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Section } from '../../types/common';
import { SectionBuilder } from './SectionBuilder';

interface TemplateBuilderProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  sections,
  onSectionsChange,
}) => {
  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: '',
      order: sections.length,
      questions: [],
      isOptional: false
    };

    onSectionsChange([...sections, newSection]);
  };

  const handleUpdateSection = (sectionId: string, updatedSection: Section) => {
    onSectionsChange(
      sections.map((section) =>
        section.id === sectionId ? updatedSection : section
      )
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    onSectionsChange(sections.filter((section) => section.id !== sectionId));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    // Update order property
    newSections.forEach((section, idx) => {
      section.order = idx;
    });
    
    onSectionsChange(newSections);
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <SectionBuilder
          key={section.id}
          section={section}
          onUpdate={(updatedSection) => handleUpdateSection(section.id, updatedSection)}
          onDelete={() => handleDeleteSection(section.id)}
          onMoveUp={index > 0 ? () => handleMoveSection(index, 'up') : undefined}
          onMoveDown={
            index < sections.length - 1
              ? () => handleMoveSection(index, 'down')
              : undefined
          }
        />
      ))}

      <button
        onClick={handleAddSection}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg
                 flex items-center justify-center gap-2 text-gray-600
                 hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        <PlusCircle size={20} />
        <span>Add Section</span>
      </button>
    </div>
  );
};