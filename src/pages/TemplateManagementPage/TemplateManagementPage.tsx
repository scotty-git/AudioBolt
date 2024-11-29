import React, { useState, useEffect } from 'react';
import { templateRepository } from '../../db/repositories';
import { Template } from '../../db/schema';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { TemplateHeader } from './components/TemplateHeader';
import { TemplateFilters } from './components/TemplateFilters';
import { TemplateTabs } from './components/TemplateTabs';
import { CreateNewDropdown } from './components/CreateNewDropdown';
import { FilterDropdown } from './components/FilterDropdown';
import { NoResults } from './components/NoResults';
import { MobileTemplateCard } from './components/MobileTemplateCard';
import { MultiSelectActions } from '../../components/common/MultiSelectActions';
import { DeleteConfirmationDialog } from '../../components/common/DeleteConfirmationDialog';
import { SelectableTable } from '../../components/common/SelectableTable';
import { useMultiSelect } from '../../hooks/useMultiSelect';
import { TemplateActions } from './components/TemplateActions';
import { Star } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

type TabType = 'all' | 'onboarding' | 'questionnaire';
type FilterStatus = 'all' | 'draft' | 'published' | 'archived';

interface FilterOptions {
  type: TabType;
  status: FilterStatus;
  dateRange: {
    start?: Date;
    end?: Date;
  };
}

export const TemplateManagementPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    status: 'all',
    dateRange: {}
  });

  const multiSelect = useMultiSelect<Template>(templates, 'id');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const allTemplates = await templateRepository.findAll();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (template: Template) => {
    try {
      await templateRepository.setDefault(template.id);
      await loadTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
    }
  };

  const handleDelete = async () => {
    try {
      for (const id of multiSelect.selectedIds) {
        await templateRepository.delete(id);
      }
      await loadTemplates();
      multiSelect.clearSelection();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting templates:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeTab === 'all' || template.type === activeTab;
    const matchesStatus = filters.status === 'all' || template.status === filters.status;
    
    let matchesDate = true;
    if (filters.dateRange.start || filters.dateRange.end) {
      const createdDate = new Date(template.created_at);
      if (filters.dateRange.start && createdDate < filters.dateRange.start) {
        matchesDate = false;
      }
      if (filters.dateRange.end) {
        const endOfDay = new Date(filters.dateRange.end);
        endOfDay.setHours(23, 59, 59, 999);
        if (createdDate > endOfDay) {
          matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const columns = [
    {
      header: 'Title',
      accessor: (template: Template) => (
        <div className="flex items-center">
          {template.is_default && (
            <Star className="w-4 h-4 text-yellow-400 mr-2" />
          )}
          <span className="font-medium text-gray-900">{template.title}</span>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: (template: Template) => (
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
          template.type === 'onboarding'
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800"
        )}>
          {template.type}
        </span>
      )
    },
    {
      header: 'Created',
      accessor: (template: Template) => (
        <span className="text-sm text-gray-600">{formatDate(template.created_at)}</span>
      )
    },
    {
      header: 'Last Modified',
      accessor: (template: Template) => (
        <span className="text-sm text-gray-600">{formatDate(template.updated_at)}</span>
      )
    },
    {
      header: '',
      accessor: (template: Template) => (
        <TemplateActions
          template={template}
          onSetDefault={handleSetDefault}
          onDelete={() => {
            multiSelect.handleToggleSelect(template.id);
            setShowDeleteDialog(true);
          }}
        />
      ),
      className: 'w-12 text-right'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TemplateHeader onCreateNew={() => setShowCreateDropdown(true)} />
      
      <div className="relative">
        <CreateNewDropdown
          isOpen={showCreateDropdown}
          onClose={() => setShowCreateDropdown(false)}
        />
      </div>

      <TemplateFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterClick={() => setShowFilterDropdown(true)}
      />

      <div className="relative">
        <FilterDropdown
          isOpen={showFilterDropdown}
          onClose={() => setShowFilterDropdown(false)}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={() => setFilters({ type: 'all', status: 'all', dateRange: {} })}
        />
      </div>

      <TemplateTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="bg-white rounded-lg shadow-sm">
        {multiSelect.selectedIds.length > 0 && (
          <MultiSelectActions
            selectedIds={multiSelect.selectedIds}
            onDelete={() => setShowDeleteDialog(true)}
            className="px-4 py-2 border-b border-gray-200"
          />
        )}

        {filteredTemplates.length === 0 ? (
          <NoResults />
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <SelectableTable
                data={filteredTemplates}
                columns={columns}
                keyField="id"
                selectedIds={multiSelect.selectedIds}
                onToggleSelect={multiSelect.handleToggleSelect}
                onToggleSelectAll={multiSelect.handleToggleSelectAll}
                className="min-h-[200px]"
              />
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-2 p-4">
              {filteredTemplates.map(template => (
                <MobileTemplateCard
                  key={template.id}
                  template={template}
                  onSetDefault={handleSetDefault}
                  onDelete={() => {
                    multiSelect.handleToggleSelect(template.id);
                    setShowDeleteDialog(true);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        itemCount={multiSelect.selectedIds.length}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          multiSelect.clearSelection();
        }}
      />
    </div>
  );
};