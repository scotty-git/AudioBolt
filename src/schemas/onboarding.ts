import { z } from 'zod';

// Base schemas
export const validationRulesSchema = z.object({
  required: z.boolean().default(false),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  pattern: z.string().optional(),
});

export const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
  value: z.string(),
});

export const conditionalLogicSchema = z.object({
  questionId: z.string(),
  operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
  value: z.union([z.string(), z.number()]),
});

// Question schema with all possible types and their specific configurations
export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'long_text', 'multiple_choice', 'slider', 'ranking']),
  text: z.string().min(1, 'Question text is required'),
  description: z.string().optional(),
  validation: validationRulesSchema,
  options: z.array(optionSchema).optional().nullable(),
  conditionalLogic: conditionalLogicSchema.optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Section schema
export const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Section title is required'),
  description: z.string(),
  questions: z.array(questionSchema),
  isOptional: z.boolean().default(false),
  order: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Progress tracking schema
export const progressSchema = z.object({
  completedSections: z.array(z.string()),
  skippedSections: z.array(z.string()),
  currentSectionId: z.string().optional().nullable(),
  lastUpdated: z.string(),
});

// Response schema
export const responseSchema = z.object({
  questionId: z.string(),
  value: z.union([z.string(), z.array(z.string()), z.number()]),
  timestamp: z.string(),
});

// Complete onboarding flow schema
export const onboardingFlowSchema = z.object({
  id: z.string(),
  version: z.string().default('1.0.0'),
  title: z.string().min(1, 'Flow title is required'),
  description: z.string(),
  sections: z.array(sectionSchema),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: z.string().optional(),
    lastModifiedBy: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
  }),
  settings: z.object({
    allowSkipSections: z.boolean().default(false),
    requireAllSections: z.boolean().default(true),
    showProgressBar: z.boolean().default(true),
    allowSaveProgress: z.boolean().default(true),
    autoSaveInterval: z.number().optional(),
  }).optional(),
});

// User progress schema
export const userProgressSchema = z.object({
  userId: z.string(),
  flowId: z.string(),
  progress: progressSchema,
  responses: z.array(responseSchema),
  metadata: z.object({
    startedAt: z.string(),
    lastUpdated: z.string(),
    completedAt: z.string().optional(),
    deviceInfo: z.string().optional(),
    userAgent: z.string().optional(),
  }),
});

// Export types
export type ValidationRules = z.infer<typeof validationRulesSchema>;
export type Option = z.infer<typeof optionSchema>;
export type ConditionalLogic = z.infer<typeof conditionalLogicSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Progress = z.infer<typeof progressSchema>;
export type Response = z.infer<typeof responseSchema>;
export type OnboardingFlow = z.infer<typeof onboardingFlowSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;