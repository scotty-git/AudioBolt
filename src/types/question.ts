import { z } from 'zod';
import { validationRulesSchema } from './validation';

export const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
  value: z.string(),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'long_text', 'multiple_choice', 'slider', 'ranking', 'email', 'phone']),
  text: z.string().min(1, 'Question text is required'),
  description: z.string().optional(),
  validation: validationRulesSchema,
  options: z.array(questionOptionSchema).optional(),
  dependsOn: z.object({
    questionId: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type QuestionOption = z.infer<typeof questionOptionSchema>;
export type Question = z.infer<typeof questionSchema>;