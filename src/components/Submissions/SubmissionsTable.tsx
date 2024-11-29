import React from 'react';
import { QuestionnaireResponse } from '../../utils/questionnaire/responseStorage';
import { SelectableTable } from '../common/SelectableTable';
import { SubmissionActions } from './SubmissionActions';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

interface SubmissionsTableProps {
  responses: QuestionnaireResponse[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onView: (response: QuestionnaireResponse) => void;
  onEdit: (response: QuestionnaireResponse) => void;
  onDelete: (response: QuestionnaireResponse) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  responses,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      header: 'Template',
      accessor: (response: QuestionnaireResponse) => (
        <span className="font-medium text-gray-900">{response.templateTitle}</span>
      )
    },
    {
      header: 'Type',
      accessor: (response: QuestionnaireResponse) => (
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
          response.type === 'onboarding'
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800"
        )}>
          {response.type}
        </span>
      )
    },
    {
      header: 'Submitted',
      accessor: (response: QuestionnaireResponse) => (
        <span className="text-sm text-gray-600">
          {formatDate(response.completedAt || '')}
        </span>
      )
    },
    {
      header: 'Questions',
      accessor: (response: QuestionnaireResponse) => (
        <span className="text-sm text-gray-600">
          {Object.keys(response.answers).length} answered
        </span>
      )
    },
    {
      header: '',
      accessor: (response: QuestionnaireResponse) => (
        <SubmissionActions
          response={response}
          onView={() => onView(response)}
          onEdit={() => onEdit(response)}
          onDelete={() => onDelete(response)}
        />
      ),
      className: 'w-12 text-right'
    }
  ];

  return (
    <SelectableTable
      data={responses}
      columns={columns}
      keyField="id"
      selectedIds={selectedIds}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
      className="min-h-[200px]"
    />
  );
};