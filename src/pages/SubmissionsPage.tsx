import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { responseRepository } from '../db/repositories';
import { QuestionnaireResponse } from '../utils/questionnaire/responseStorage';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { SubmissionsHeader } from '../components/Submissions/SubmissionsHeader';
import { SubmissionsStats } from '../components/Submissions/SubmissionsStats';
import { SubmissionsTabs } from '../components/Submissions/SubmissionsTabs';
import { SubmissionsFilters } from '../components/Submissions/SubmissionsFilters';
import { SubmissionsTable } from '../components/Submissions/SubmissionsTable';
import { SubmissionDetails } from '../components/Submissions/SubmissionDetails';
import { EditSubmissionModal } from '../components/Submissions/EditSubmissionModal';
import { DeleteConfirmationDialog } from '../components/common/DeleteConfirmationDialog';
import { useMultiSelect } from '../hooks/useMultiSelect';

export const SubmissionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'onboarding' | 'questionnaire'>('all');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<QuestionnaireResponse | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<QuestionnaireResponse | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<QuestionnaireResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const multiSelect = useMultiSelect<QuestionnaireResponse>(responses, 'id');

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      setIsLoading(true);
      const loadedResponses = await responseRepository.findAll();
      const mappedResponses = loadedResponses.map(response => ({
        id: response.id,
        templateId: response.template_id,
        templateTitle: JSON.parse(response.metadata || '{}').templateTitle || 'Unknown Template',
        type: response.template_id.includes('onboarding') ? 'onboarding' : 'questionnaire',
        answers: JSON.parse(response.answers),
        completedSections: JSON.parse(response.metadata || '{}').completedSections || [],
        currentSectionIndex: JSON.parse(response.metadata || '{}').currentSectionIndex || 0,
        completedAt: response.completed_at,
        content: JSON.parse(response.metadata || '{}').content
      }));
      setResponses(mappedResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (response: QuestionnaireResponse) => {
    try {
      await responseRepository.delete(response.id);
      await loadResponses();
      setDeleteConfirmation(null);
      multiSelect.clearSelection();
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  const filteredResponses = responses.filter(response => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = response.templateTitle.toLowerCase().includes(searchLower);
    const matchesType = activeTab === 'all' || response.type === activeTab;
    
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const submissionDate = new Date(response.completedAt || '');
      if (dateRange.start && submissionDate < dateRange.start) {
        matchesDate = false;
      }
      if (dateRange.end) {
        const endOfDay = new Date(dateRange.end);
        endOfDay.setHours(23, 59, 59, 999);
        if (submissionDate > endOfDay) {
          matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubmissionsHeader
        responses={responses}
        selectedIds={multiSelect.selectedIds}
      />

      <SubmissionsStats responses={responses} />

      <div className="bg-white rounded-lg shadow-sm">
        <SubmissionsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <SubmissionsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          templateType={activeTab}
          onTemplateTypeChange={setActiveTab}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || showFilters ? 'No results match your search.' : 'Start by completing a questionnaire or onboarding.'}
            </p>
          </div>
        ) : (
          <SubmissionsTable
            responses={filteredResponses}
            selectedIds={multiSelect.selectedIds}
            onToggleSelect={multiSelect.handleToggleSelect}
            onToggleSelectAll={multiSelect.handleToggleSelectAll}
            onView={setSelectedSubmission}
            onEdit={setEditingSubmission}
            onDelete={(response) => setDeleteConfirmation(response)}
          />
        )}
      </div>

      {selectedSubmission && (
        <SubmissionDetails
          response={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {editingSubmission && (
        <EditSubmissionModal
          response={editingSubmission}
          onClose={() => setEditingSubmission(null)}
          onSave={async (updatedAnswers) => {
            try {
              await responseRepository.update(editingSubmission.id, {
                answers: JSON.stringify(updatedAnswers),
                last_updated: new Date().toISOString()
              });
              await loadResponses();
              setEditingSubmission(null);
            } catch (error) {
              console.error('Error updating submission:', error);
            }
          }}
        />
      )}

      {deleteConfirmation && (
        <DeleteConfirmationDialog
          isOpen={true}
          itemCount={1}
          onConfirm={() => handleDelete(deleteConfirmation)}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
};