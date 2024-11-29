import { z } from 'zod';

// Base schemas
export const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  value: z.string(),
});

export const followUpConditionSchema = z.object({
  questionId: z.string(),
  operator: z.enum(['equals', 'contains', 'greaterThan', 'lessThan']),
  value: z.union([z.string(), z.number()]),
});

export const followUpSchema = z.object({
  condition: followUpConditionSchema,
  questions: z.array(z.lazy(() => questionSchema)),
});

// Question schema
export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'multipleChoice', 'rating', 'slider', 'boolean']),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(true),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
  options: z.array(questionOptionSchema).optional(),
  followUp: followUpSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Template schema
export const templateSchema = z.object({
  templateId: z.string(),
  version: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  questions: z.array(questionSchema),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    author: z.string(),
    targetAudience: z.array(z.string()),
    estimatedDuration: z.number(),
  }),
});