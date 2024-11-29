import React from 'react';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { QuestionnaireResponse } from '../../utils/questionnaire/responseStorage';

interface SubmissionsStatsProps {
  responses: QuestionnaireResponse[];
}

export const SubmissionsStats: React.FC<SubmissionsStatsProps> = ({ responses }) => {
  const stats = {
    total: responses.length,
    onboarding: responses.filter(r => r.templateTitle.includes('Onboarding')).length,
    questionnaires: responses.filter(r => !r.templateTitle.includes('Onboarding')).length,
    today: responses.filter(r => {
      const today = new Date();
      const submissionDate = new Date(r.completedAt || '');
      return submissionDate.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total Submissions</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <FileText className="text-blue-600" size={24} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Onboarding</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.onboarding}</p>
        </div>
        <CheckCircle className="text-blue-600" size={24} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Questionnaires</p>
          <p className="text-2xl font-semibold text-green-600">{stats.questionnaires}</p>
        </div>
        <FileText className="text-green-600" size={24} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Today</p>
          <p className="text-2xl font-semibold text-gray-600">{stats.today}</p>
        </div>
        <Clock className="text-gray-600" size={24} />
      </div>
    </div>
  );
};