import { z } from 'zod';

// Common option schema for all question types
export const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
  value: z.string()
});

// Common validation rules
export const validationSchema = z.object({
  required: z.boolean().default(false),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  step: z.number().optional(),
  pattern: z.string().optional(),
  minSelected: z.number().optional()
});

// Common question schema
export const baseQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'select', 'radio', 'checkbox', 'slider', 'long_text', 'number']),
  text: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  validation: validationSchema,
  options: z.array(optionSchema).optional()
});

// Common section schema
export const baseSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  isOptional: z.boolean().default(false),
  questions: z.array(baseQuestionSchema)
});

// Common settings schema
export const baseSettingsSchema = z.object({
  allowSkipSections: z.boolean().default(false),
  showProgressBar: z.boolean().default(true),
  shuffleSections: z.boolean().default(false),
  completionMessage: z.string().optional(),
  allowSaveProgress: z.boolean().default(true),
  autoSaveInterval: z.number().optional()
});

// Common metadata schema
export const metadataSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().optional(),
  lastModifiedBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
});

// Export types
export type Option = z.infer<typeof optionSchema>;
export type Validation = z.infer<typeof validationSchema>;
export type BaseQuestion = z.infer<typeof baseQuestionSchema>;
export type BaseSection = z.infer<typeof baseSectionSchema>;
export type BaseSettings = z.infer<typeof baseSettingsSchema>;
export type Metadata = z.infer<typeof metadataSchema>;