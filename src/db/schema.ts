import { z } from 'zod';

// Core table schemas
export const templateSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['onboarding', 'questionnaire']),
  content: z.string(), // JSON string of template content
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  version: z.string(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  category: z.string().optional(),
  tags: z.string().optional(), // JSON array string
});

export const responseSchema = z.object({
  id: z.string(),
  template_id: z.string(),
  user_id: z.string(),
  answers: z.string(), // JSON string of answers
  started_at: z.string(),
  completed_at: z.string().optional(),
  last_updated: z.string(),
  metadata: z.string().optional(), // JSON string for additional data
});

// Export types
export type Template = z.infer<typeof templateSchema>;
export type Response = z.infer<typeof responseSchema>;