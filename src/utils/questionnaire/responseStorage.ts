export interface QuestionnaireResponse {
  id: string;
  templateId: string;
  templateTitle: string;
  type: 'onboarding' | 'questionnaire';
  answers: Record<string, string | string[]>;
  completedSections: string[];
  currentSectionIndex: number;
  completedAt?: string;
  content?: string;
}

export const saveQuestionnaireResponse = async (response: QuestionnaireResponse) => {
  try {
    const responseId = response.id;
    const timestamp = new Date().toISOString();

    await responseRepository.create({
      id: responseId,
      template_id: response.templateId,
      user_id: 'anonymous',
      answers: JSON.stringify(response.answers),
      started_at: timestamp,
      completed_at: response.completedAt,
      last_updated: timestamp,
      metadata: JSON.stringify({
        templateTitle: response.templateTitle,
        completedSections: response.completedSections,
        currentSectionIndex: response.currentSectionIndex,
        deviceInfo: window.navigator.platform,
        userAgent: window.navigator.userAgent,
        content: response.content,
        type: response.type
      }),
    });

    return { id: responseId, ...response };
  } catch (error) {
    console.error('Error saving questionnaire response:', error);
    throw error;
  }
};

export const loadQuestionnaireResponses = async (): Promise<QuestionnaireResponse[]> => {
  try {
    const responses = await responseRepository.findAll();
    return responses.map(response => ({
      id: response.id,
      templateId: response.template_id,
      templateTitle: JSON.parse(response.metadata || '{}').templateTitle || 'Unknown Template',
      type: response.template_id.includes('onboarding') ? 'onboarding' : 'questionnaire',
      answers: JSON.parse(response.answers),
      completedSections: JSON.parse(response.metadata || '{}').completedSections || [],
      currentSectionIndex: JSON.parse(response.metadata || '{}').currentSectionIndex || 0,
      completedAt: response.completed_at,
      content: JSON.parse(response.metadata || '{}').content
    }));
  } catch (error) {
    console.error('Error loading questionnaire responses:', error);
    return [];
  }
};

export const deleteQuestionnaireResponse = async (responseId: string): Promise<void> => {
  try {
    await responseRepository.delete(responseId);
  } catch (error) {
    console.error('Error deleting questionnaire response:', error);
    throw error;
  }
};