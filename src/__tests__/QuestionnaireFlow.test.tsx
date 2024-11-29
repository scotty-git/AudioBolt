import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QuestionnairePage } from '../pages/QuestionnairePage';
import { QuestionnaireTemplate } from '../types/questionnaire';
import * as localStorage from '../utils/localStorage';

vi.mock('../utils/localStorage', () => ({
  loadTemplates: vi.fn(),
  saveQuestionnaireResponse: vi.fn(),
}));

describe('Questionnaire Flow', () => {
  const mockTemplate: QuestionnaireTemplate = {
    id: 'test-template',
    title: 'Test Questionnaire',
    description: 'Test Description',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Question 1',
        options: ['Option 1', 'Option 2'],
        required: true,
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Question 2',
        required: false,
      },
    ],
  };

  beforeEach(() => {
    vi.mocked(localStorage.loadTemplates).mockReturnValue([mockTemplate]);
  });

  it('displays questionnaire title and description', async () => {
    render(
      <BrowserRouter>
        <QuestionnairePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Questionnaire')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('shows error for required questions', async () => {
    render(
      <BrowserRouter>
        <QuestionnairePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('This question is required')).toBeInTheDocument();
    });
  });

  it('allows navigation between questions', async () => {
    render(
      <BrowserRouter>
        <QuestionnairePage />
      </BrowserRouter>
    );

    // Answer first question
    await waitFor(() => {
      const option = screen.getByText('Option 1');
      expect(option).toBeInTheDocument();
    });

    const option = screen.getByText('Option 1');
    await userEvent.click(option);

    // Go to next question
    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    // Go back
    const prevButton = screen.getByText('Previous');
    await userEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
  });
});