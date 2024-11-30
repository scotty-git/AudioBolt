import { Timestamp } from 'firebase/firestore';

export type SubmissionStatus = 'in_progress' | 'completed' | 'archived';

export interface Submission {
  // Required fields
  userId: string;
  templateId: string;
  responses: Record<string, any>;
  status: SubmissionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Optional fields
  completedAt?: Timestamp;
}

export interface SubmissionCreate extends Omit<Submission, 'createdAt' | 'updatedAt'> {
  // createdAt and updatedAt will be auto-generated
}

export interface SubmissionUpdate extends Partial<Omit<Submission, 'createdAt' | 'userId' | 'templateId'>> {
  // Can't update createdAt, userId, or templateId
  updatedAt: Timestamp;
}
