import React from 'react';
import { PlusCircle } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { Question } from '../../types/questionnaire';

interface QuestionListProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onQuestionsChange,
}) => {
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: 'text',
      question: 'New Question',
      required: true,
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const deleteQuestion = (id: string) => {
    onQuestionsChange(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updatedQuestion: Question) => {
    onQuestionsChange(
      questions.map((q) => (q.id === id ? updatedQuestion : q))
    );
  };

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          questionIndex={index}
          onDelete={deleteQuestion}
          onUpdate={updateQuestion}
        />
      ))}
      
      <button
        onClick={addQuestion}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg
                 flex items-center justify-center gap-2 text-gray-600
                 hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        <PlusCircle size={20} />
        <span>Add Question</span>
      </button>
    </div>
  );
};