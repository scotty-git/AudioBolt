export interface ArchiveSubmissionRequest {
  submissionId: string;
  reason?: string;  // Optional reason for archiving
}

export interface BatchArchiveRequest {
  submissionIds: string[];
  reason?: string;
}

export class ArchiveError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public submissionId?: string
  ) {
    super(message);
    this.name = 'ArchiveError';
  }
}

export interface ArchiveResult {
  success: boolean;
  message: string;
  submissionId: string;
  timestamp: FirebaseFirestore.Timestamp;
}
