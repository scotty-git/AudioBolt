import React, { useState } from 'react';
import { Question } from '../../../../types/onboarding';
import { cn } from '../../../../utils/cn';

interface RankingQuestionProps {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
}

export const RankingQuestion: React.FC<RankingQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!question.options) return null;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newOrder = [...value];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, removed);
    onChange(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      {question.options.map((option, index) => (
        <div
          key={option.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={cn(
            "flex items-center p-3 border rounded-lg cursor-move transition-colors",
            draggedIndex === index ? "opacity-50" : "opacity-100",
            "hover:bg-gray-50"
          )}
        >
          <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
            {index + 1}
          </span>
          <span className="ml-3">{option.text}</span>
        </div>
      ))}
    </div>
  );
};