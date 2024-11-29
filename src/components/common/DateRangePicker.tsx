import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (range: { start?: Date; end?: Date }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="date"
          value={startDate?.toISOString().split('T')[0] || ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : undefined;
            onChange({ start: date, end: endDate });
          }}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <span className="text-gray-500">to</span>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="date"
          value={endDate?.toISOString().split('T')[0] || ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : undefined;
            onChange({ start: startDate, end: date });
          }}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
};