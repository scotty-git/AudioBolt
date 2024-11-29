import { z } from 'zod';

// Base schemas
const timestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number()
});

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sex: z.enum(['male', 'female', 'other']),
  created_at: timestampSchema,
  updated_at: timestampSchema
});

// Template schema
export const templateSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['onboarding', 'questionnaire']),
  title: z.string().min(1),
  description: z.string(),
  content: z.record(z.unknown()),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  is_default: z.boolean(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
  status: z.enum(['draft', 'published', 'archived']),
  category_id: z.string().uuid().optional()
});

// Submission schemas
const submissionBaseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  template_id: z.string().uuid(),
  responses: z.record(z.unknown()),
  status: z.enum(['in_progress', 'completed']),
  submitted_at: timestampSchema.optional(),
  version: z.string(),
  metadata: z.record(z.unknown()).optional()
});

export const onboardingSubmissionSchema = submissionBaseSchema.extend({
  type: z.literal('onboarding')
});

export const questionnaireSubmissionSchema = submissionBaseSchema.extend({
  type: z.literal('questionnaire')
});

// Export types
export type User = z.infer<typeof userSchema>;
export type Template = z.infer<typeof templateSchema>;
export type OnboardingSubmission = z.infer<typeof onboardingSubmissionSchema>;
export type QuestionnaireSubmission = z.infer<typeof questionnaireSubmissionSchema>;