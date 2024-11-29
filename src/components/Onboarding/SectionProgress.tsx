import React from 'react';
import { cn } from '../../utils/cn';
import { Section } from '../../types/onboarding';

interface SectionProgressProps {
  sections: Section[];
  currentSectionIndex: number;
  completedSections: string[];
}

export const SectionProgress: React.FC<SectionProgressProps> = ({
  sections,
  currentSectionIndex,
  completedSections,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4">
        {/* Section Progress */}
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${(currentSectionIndex / (sections.length - 1)) * 100}%`
              }}
            />
          </div>

          {/* Section Indicators */}
          {sections.map((section, index) => {
            const isCompleted = completedSections.includes(section.id);
            const isCurrent = index === currentSectionIndex;
            
            return (
              <div 
                key={section.id} 
                className="flex flex-col items-center relative"
                style={{ minWidth: '120px' }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center bg-white z-10",
                    isCompleted && "bg-blue-600 text-white",
                    isCurrent && "border-2 border-blue-600 text-blue-600",
                    !isCompleted && !isCurrent && "border-2 border-gray-200 text-gray-400"
                  )}
                >
                  {index + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium mt-2 text-center px-2",
                  isCompleted && "text-blue-600",
                  isCurrent && "text-blue-600",
                  !isCompleted && !isCurrent && "text-gray-400"
                )}>
                  {section.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Section Counter */}
        <div className="text-sm text-gray-600 text-right">
          Section {currentSectionIndex + 1} of {sections.length}
        </div>
      </div>
    </div>
  );
};