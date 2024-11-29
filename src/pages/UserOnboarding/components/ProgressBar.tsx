import React from 'react';
import { cn } from '../../../utils/cn';
import { calculateProgress } from '../../../utils/progressCalculation';
import { Section, Response } from '../../../types/onboarding';

interface ProgressBarProps {
  sections: Section[] | undefined;
  responses: Record<string, Response>;
  skippedSectionIds: string[];
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  sections,
  responses,
  skippedSectionIds,
  className,
}) => {
  const { completedQuestions, totalQuestions, percentage } = calculateProgress(
    sections,
    responses,
    skippedSectionIds
  );

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          {completedQuestions} of {totalQuestions} questions completed
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};