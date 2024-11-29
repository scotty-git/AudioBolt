import { useState, useMemo } from 'react';
import { Template } from '../../../db/schema';

export const useTemplateFilters = (templates: Template[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<Template['type'] | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 10;

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
      const matchesType = typeFilter === 'all' || template.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [templates, searchTerm, statusFilter, typeFilter]);

  const paginatedTemplates = useMemo(() => {
    return filteredTemplates.slice(
      (currentPage - 1) * templatesPerPage,
      currentPage * templatesPerPage
    );
  }, [filteredTemplates, currentPage]);

  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    filteredTemplates,
    paginatedTemplates,
    totalPages,
    resetFilters,
  };
};