import { z } from 'zod';
import {
  baseQuestionSchema,
  baseSectionSchema,
  baseSettingsSchema,
  metadataSchema
} from './common';

// Extend base schemas with questionnaire-specific fields
export const questionnaireQuestionSchema = baseQuestionSchema.extend({
  // Add any questionnaire-specific question fields here
});

export const questionnaireSectionSchema = baseSectionSchema.extend({
  questions: z.array(questionnaireQuestionSchema)
});

export const questionnaireSettingsSchema = baseSettingsSchema.extend({
  timeLimit: z.number().optional(),
  passingScore: z.number().optional()
});

// Complete questionnaire schema
export const questionnaireSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  type: z.literal('questionnaire'),
  sections: z.array(questionnaireSectionSchema),
  settings: questionnaireSettingsSchema,
  metadata: metadataSchema
});

// Export types
export type QuestionnaireQuestion = z.infer<typeof questionnaireQuestionSchema>;
export type QuestionnaireSection = z.infer<typeof questionnaireSectionSchema>;
export type QuestionnaireSettings = z.infer<typeof questionnaireSettingsSchema>;
export type Questionnaire = z.infer<typeof questionnaireSchema>;