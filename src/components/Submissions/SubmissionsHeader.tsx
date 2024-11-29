import React from 'react';
import { ClipboardList } from 'lucide-react';
import { ExportButton } from './ExportButton';
import { QuestionnaireResponse } from '../../utils/questionnaire/responseStorage';

interface SubmissionsHeaderProps {
  responses: QuestionnaireResponse[];
  selectedIds: string[];
}

export const SubmissionsHeader: React.FC<SubmissionsHeaderProps> = ({
  responses,
  selectedIds,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-blue-600" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Submissions
          </h1>
          <p className="text-gray-600">
            View and manage questionnaire and onboarding responses
          </p>
        </div>
      </div>
      <ExportButton 
        responses={responses} 
        selectedIds={selectedIds}
      />
    </div>
  );
};