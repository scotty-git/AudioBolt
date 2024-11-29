export interface Template {
  id: string;
  type: 'onboarding' | 'questionnaire';
  title: string;
  description: string;
  content: string;
  version: string;
  is_default: boolean;
  status: 'draft' | 'published' | 'archived';
  category_id?: string | null;
  created_at: string;
  updated_at: string;
}