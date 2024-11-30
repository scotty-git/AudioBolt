import { SubmissionStatus } from './submission';

export interface SubmissionQueryOptions {
  userId?: string;
  status?: SubmissionStatus;
  templateId?: string;
  pageSize?: number;
  pageToken?: string;
  sortField?: 'completedAt' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

export interface SubmissionQueryResult<T> {
  items: T[];
  nextPageToken?: string;
  total: number;
  hasMore: boolean;
}

export interface SubmissionQueryToken {
  lastDoc: {
    completedAt: string | null;
    createdAt: string;
    id: string;
  };
  filters: {
    userId?: string;
    status?: SubmissionStatus;
    templateId?: string;
  };
  pageSize: number;
  sortField: 'completedAt' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}
