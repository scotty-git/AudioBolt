import React from 'react';
import { Question } from '../../../../types/onboarding';

interface SliderQuestionProps {
  question: Question;
  value: number;
  onChange: (value: number) => void;
}

export const SliderQuestion: React.FC<SliderQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  const min = question.validation.minValue || 0;
  const max = question.validation.maxValue || 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="text-center font-medium text-gray-900">
        Selected: {value}
      </div>
    </div>
  );
};