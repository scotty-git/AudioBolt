import { useState, useCallback } from 'react';

export function useMultiSelect<T>(items: T[], idField: keyof T) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds(prev => 
      prev.length === items.length
        ? []
        : items.map(item => String(item[idField]))
    );
  }, [items, idField]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    handleToggleSelect,
    handleToggleSelectAll,
    clearSelection
  };
}