import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionRenderer } from '../../pages/UserOnboarding/components/QuestionRenderer';
import { Question } from '../../types/onboarding';

describe('QuestionRenderer', () => {
  const mockOnChange = vi.fn();
  const baseQuestion: Question = {
    id: 'test-question',
    type: 'text',
    text: 'Test Question',
    validation: { required: true }
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Text Questions', () => {
    it('renders short text input correctly', () => {
      render(
        <QuestionRenderer
          question={baseQuestion}
          value=""
          onChange={mockOnChange}
          responses={{}}
        />
      );

      const input = screen.getByPlaceholderText('Type your answer here...');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('renders long text input correctly', () => {
      render(
        <QuestionRenderer
          question={{ ...baseQuestion, type: 'long_text' }}
          value=""
          onChange={mockOnChange}
          responses={{}}
        />
      );

      const textarea = screen.getByPlaceholderText('Type your answer here...');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('Multiple Choice Questions', () => {
    const multipleChoiceQuestion: Question = {
      ...baseQuestion,
      type: 'multiple_choice',
      options: [
        { id: '1', text: 'Option 1', value: 'option1' },
        { id: '2', text: 'Option 2', value: 'option2' }
      ]
    };

    it('renders all options correctly', () => {
      render(
        <QuestionRenderer
          question={multipleChoiceQuestion}
          value=""
          onChange={mockOnChange}
          responses={{}}
        />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles option selection correctly', async () => {
      render(
        <QuestionRenderer
          question={multipleChoiceQuestion}
          value=""
          onChange={mockOnChange}
          responses={{}}
        />
      );

      const option1 = screen.getByTestId('option-1');
      await userEvent.click(option1);
      expect(mockOnChange).toHaveBeenCalledWith('option1');
    });
  });

  // ... rest of the test file remains unchanged
});