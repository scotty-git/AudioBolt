import { getDatabase } from '../client';

export interface Submission {
  id: string;
  template_id: string;
  user_id: string;
  answers: string; // JSON string
  started_at: string;
  last_updated: string;
  completed_at?: string;
  metadata?: string; // JSON string
}

export interface SubmissionData {
  type: 'onboarding' | 'questionnaire';
  templateId: string;
  userId: string;
  userEmail: string;
  answers: Record<string, string | string[]>;
  metadata: {
    templateTitle: string;
    completedSections: string[];
    currentSectionIndex: number;
    content: string;
  };
}

export const submissionRepository = {
  async create(data: SubmissionData): Promise<void> {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const submission: Submission = {
      id: crypto.randomUUID(),
      template_id: data.templateId,
      user_id: data.userId,
      answers: JSON.stringify(data.answers),
      started_at: now,
      last_updated: now,
      metadata: JSON.stringify({
        type: data.type,
        userEmail: data.userEmail,
        ...data.metadata
      })
    };

    try {
      await db.put('responses', submission);
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  async getByUserId(userId: string): Promise<SubmissionData[]> {
    const db = getDatabase();
    try {
      const submissions = await db.getAllFromIndex('responses', 'by-user', userId);
      return submissions.map(submission => ({
        type: JSON.parse(submission.metadata || '{}').type || 'questionnaire',
        templateId: submission.template_id,
        userId: submission.user_id,
        userEmail: JSON.parse(submission.metadata || '{}').userEmail || '',
        answers: JSON.parse(submission.answers),
        metadata: JSON.parse(submission.metadata || '{}')
      }));
    } catch (error) {
      console.error('Error getting submissions:', error);
      return [];
    }
  },

  async getByTemplateId(templateId: string): Promise<SubmissionData[]> {
    const db = getDatabase();
    try {
      const submissions = await db.getAllFromIndex('responses', 'by-template', templateId);
      return submissions.map(submission => ({
        type: JSON.parse(submission.metadata || '{}').type || 'questionnaire',
        templateId: submission.template_id,
        userId: submission.user_id,
        userEmail: JSON.parse(submission.metadata || '{}').userEmail || '',
        answers: JSON.parse(submission.answers),
        metadata: JSON.parse(submission.metadata || '{}')
      }));
    } catch (error) {
      console.error('Error getting submissions:', error);
      return [];
    }
  }
}; 