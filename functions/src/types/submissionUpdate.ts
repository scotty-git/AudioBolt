import { Submission, SubmissionStatus } from './submission';

export interface SubmissionUpdateRequest {
  submissionId: string;
  responses?: Record<string, any>;
  status?: SubmissionStatus;
  templateId?: string;
}

export interface SubmissionVersion extends Omit<Submission, 'id'> {
  versionId: string;
  timestamp: FirebaseFirestore.Timestamp;
  changedBy: string;
  changeType: 'status' | 'responses' | 'template';
}

export class SubmissionUpdateError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public field?: string
  ) {
    super(message);
    this.name = 'SubmissionUpdateError';
  }
}

export const VALID_STATUS_TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
  'in_progress': ['completed'],
  'completed': ['archived'],
  'archived': []
};
