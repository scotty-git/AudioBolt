import React from 'react';
import { cn } from '../../utils/cn';

interface Column<T> {
  header: string;
  accessor: ((item: T) => React.ReactNode) | keyof T;
  className?: string;
}

interface SelectableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  className?: string;
}

export function SelectableTable<T extends { [key: string]: any }>({
  data,
  columns,
  keyField,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  className
}: SelectableTableProps<T>) {
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-4 py-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) {
                    input.indeterminate = isPartiallySelected;
                  }
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 
                         focus:ring-blue-500 cursor-pointer"
              />
            </th>
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  "px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => {
            const id = String(item[keyField]);
            return (
              <tr key={id} className="hover:bg-gray-50">
                <td className="w-10 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(id)}
                    onChange={() => onToggleSelect(id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 
                             focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={cn(
                      "px-4 py-2 whitespace-nowrap text-sm",
                      column.className
                    )}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : item[column.accessor]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}