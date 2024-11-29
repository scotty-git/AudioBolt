import { QuestionnaireResponse } from './questionnaireStorage';
import { QuestionnaireTemplate } from '../types/questionnaire';

export const exportToJson = (
  responses: QuestionnaireResponse[],
  templates: QuestionnaireTemplate[]
) => {
  const exportData = responses.map(response => {
    const template = templates.find(t => t.id === response.templateId);
    return {
      templateTitle: template?.title || 'Unknown Template',
      templateId: response.templateId,
      submittedAt: response.completedAt,
      answers: Object.entries(response.answers).map(([questionId, answer]) => {
        const question = template?.questions.find(q => q.id === questionId);
        return {
          question: question?.question || 'Unknown Question',
          answer,
        };
      }),
    };
  });

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  return blob;
};

export const exportToCsv = (
  responses: QuestionnaireResponse[],
  templates: QuestionnaireTemplate[]
) => {
  const rows = [['Template', 'Submission Date', 'Question', 'Answer']];

  responses.forEach(response => {
    const template = templates.find(t => t.id === response.templateId);
    Object.entries(response.answers).forEach(([questionId, answer]) => {
      const question = template?.questions.find(q => q.id === questionId);
      rows.push([
        template?.title || 'Unknown Template',
        response.completedAt || 'Unknown Date',
        question?.question || 'Unknown Question',
        Array.isArray(answer) ? answer.join(', ') : answer.toString(),
      ]);
    });
  });

  const csvContent = rows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return blob;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};