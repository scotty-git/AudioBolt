import React from 'react';
import { cn } from '../../utils/cn';

interface SubmissionsTabsProps {
  activeTab: 'all' | 'onboarding' | 'questionnaire';
  onTabChange: (tab: 'all' | 'onboarding' | 'questionnaire') => void;
}

export const SubmissionsTabs: React.FC<SubmissionsTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'all', label: 'All Submissions' },
    { id: 'onboarding', label: 'Onboarding Responses' },
    { id: 'questionnaire', label: 'Questionnaire Responses' },
  ] as const;

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};