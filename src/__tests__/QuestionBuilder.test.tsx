import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionCard } from '../components/QuestionBuilder/QuestionCard';
import { QuestionList } from '../components/QuestionBuilder/QuestionList';

describe('QuestionBuilder Components', () => {
  describe('QuestionCard', () => {
    const mockQuestion = {
      id: 'q1',
      type: 'text' as const,
      question: 'Test Question',
      required: true
    };

    const mockProps = {
      question: mockQuestion,
      onDelete: vi.fn(),
      onUpdate: vi.fn(),
      questionIndex: 0
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('renders question details correctly', () => {
      render(<QuestionCard {...mockProps} />);
      expect(screen.getByDisplayValue('Test Question')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveValue('text');
    });

    it('handles question text changes', async () => {
      render(<QuestionCard {...mockProps} />);
      const input = screen.getByDisplayValue('Test Question');
      await userEvent.clear(input);
      await userEvent.type(input, 'Updated Question');
      
      expect(mockProps.onUpdate).toHaveBeenCalledWith('q1', {
        ...mockQuestion,
        question: 'Updated Question'
      });
    });

    it('handles question type changes', async () => {
      render(<QuestionCard {...mockProps} />);
      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'multiple-choice');
      
      expect(mockProps.onUpdate).toHaveBeenCalledWith('q1', {
        ...mockQuestion,
        type: 'multiple-choice',
        options: ['Option 1']
      });
    });
  });

  describe('QuestionList', () => {
    const mockQuestions = [
      {
        id: 'q1',
        type: 'text' as const,
        question: 'Question 1',
        required: true
      }
    ];

    it('renders questions correctly', () => {
      render(
        <QuestionList
          questions={mockQuestions}
          onQuestionsChange={vi.fn()}
        />
      );
      expect(screen.getByDisplayValue('Question 1')).toBeInTheDocument();
    });

    it('adds new question when button is clicked', async () => {
      const onQuestionsChange = vi.fn();
      render(
        <QuestionList
          questions={mockQuestions}
          onQuestionsChange={onQuestionsChange}
        />
      );
      
      const addButton = screen.getByText(/Add Question/i);
      await userEvent.click(addButton);
      
      expect(onQuestionsChange).toHaveBeenCalledWith([
        ...mockQuestions,
        expect.objectContaining({
          id: expect.any(String),
          type: 'text',
          question: 'New Question',
          required: true
        })
      ]);
    });
  });
});