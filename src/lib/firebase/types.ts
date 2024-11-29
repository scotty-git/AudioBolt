import { Timestamp } from 'firebase/firestore';

export interface FirebaseUser {
  id: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  user_id: string;
  profile_data: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;
  metadata?: Record<string, any>;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface OnboardingSubmission {
  id: string;
  userId: string;
  flowId: string;
  responses: Record<string, any>;
  progress: {
    completedSections: string[];
    skippedSections: string[];
    currentSectionId?: string;
    lastUpdated: Timestamp;
  };
  startedAt: Timestamp;
  completedAt?: Timestamp;
  lastUpdated: Timestamp;
  metadata?: Record<string, any>;
}

export interface QuestionnaireSubmission {
  id: string;
  userId: string;
  templateId: string;
  answers: Record<string, any>;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  lastUpdated: Timestamp;
  status: 'in_progress' | 'completed' | 'abandoned';
  metadata?: Record<string, any>;
}