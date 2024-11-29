export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface OnboardingSubmission {
  id: string;
  user_id: string;
  flow_id: string;
  responses: Record<string, any>;
  progress: {
    completedSections: string[];
    skippedSections: string[];
    currentSectionId?: string;
    lastUpdated: string;
  };
  started_at: string;
  completed_at?: string;
  last_updated: string;
  metadata?: Record<string, any>;
}

export interface QuestionnaireSubmission {
  id: string;
  user_id: string;
  template_id: string;
  answers: Record<string, any>;
  started_at: string;
  completed_at?: string;
  last_updated: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  metadata?: Record<string, any>;
}