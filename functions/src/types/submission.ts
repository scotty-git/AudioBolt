import { FieldValue } from 'firebase-admin/firestore';

export type SubmissionStatus = 'in_progress' | 'completed' | 'archived';

export interface CreateSubmissionRequest {
  userId: string;
  templateId: string;
  responses: Record<string, any>;
  status?: SubmissionStatus;
}

export interface Submission {
  userId: string;
  templateId: string;
  responses: Record<string, any>;
  status: SubmissionStatus;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
  completedAt?: FieldValue | Date;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export class SubmissionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public field?: string
  ) {
    super(message);
    this.name = 'SubmissionError';
  }
}
