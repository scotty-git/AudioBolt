import { z } from 'zod';
import {
  baseQuestionSchema,
  baseSectionSchema,
  baseSettingsSchema,
  metadataSchema
} from './common';

// Extend base schemas with onboarding-specific fields
export const onboardingQuestionSchema = baseQuestionSchema;

export const onboardingSectionSchema = baseSectionSchema;

export const onboardingSettingsSchema = baseSettingsSchema.extend({
  requireAllSections: z.boolean().default(true),
  completionRedirect: z.string().optional()
});

// Complete onboarding flow schema
export const onboardingFlowSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  type: z.literal('onboarding'),
  isDefault: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  sections: z.array(onboardingSectionSchema),
  settings: onboardingSettingsSchema.default({
    allowSkipSections: false,
    showProgressBar: true,
    shuffleSections: false,
    requireAllSections: true,
    completionMessage: "Thank you for completing the onboarding process!"
  }),
  metadata: metadataSchema.optional()
});

// Progress tracking schema
export const progressSchema = z.object({
  completedSections: z.array(z.string()),
  skippedSections: z.array(z.string()),
  currentSectionId: z.string().optional(),
  lastUpdated: z.string()
});

// Response schema
export const responseSchema = z.object({
  questionId: z.string(),
  value: z.union([z.string(), z.array(z.string()), z.number()]),
  timestamp: z.string()
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
    userAgent: z.string().optional()
  })
});

// Export types
export type OnboardingQuestion = z.infer<typeof onboardingQuestionSchema>;
export type OnboardingSection = z.infer<typeof onboardingSectionSchema>;
export type OnboardingSettings = z.infer<typeof onboardingSettingsSchema>;
export type OnboardingFlow = z.infer<typeof onboardingFlowSchema>;
export type Progress = z.infer<typeof progressSchema>;
export type Response = z.infer<typeof responseSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;