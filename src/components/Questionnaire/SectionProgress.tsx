import React from 'react';
import { cn } from '../../utils/cn';
import { QuestionnaireSection } from '../../types/questionnaire';

interface SectionProgressProps {
  sections: QuestionnaireSection[];
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {sections.map((section, index) => {
            const isCompleted = completedSections.includes(section.id);
            const isCurrent = index === currentSectionIndex;
            
            return (
              <div
                key={section.id}
                className={cn(
                  "flex items-center gap-2",
                  (isCompleted || isCurrent) ? "text-blue-600" : "text-gray-400"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                  isCompleted && "bg-blue-600 text-white",
                  isCurrent && "border-2 border-blue-600 text-blue-600",
                  !isCompleted && !isCurrent && "border-2 border-gray-200 text-gray-400"
                )}>
                  {index + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isCompleted && "text-blue-600",
                  isCurrent && "text-blue-600",
                  !isCompleted && !isCurrent && "text-gray-400"
                )}>
                  {section.title}
                </span>
                {index < sections.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5",
                    isCompleted ? "bg-blue-600" : "bg-gray-200"
                  )} />
                )}
              </div>
            );
          })}
        </div>
        <span className="text-sm text-gray-600">
          Section {currentSectionIndex + 1} of {sections.length}
        </span>
      </div>
    </div>
  );
};