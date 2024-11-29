import { z } from 'zod';

export const validationRulesSchema = z.object({
  required: z.boolean().default(false),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  pattern: z.string().optional(),
  customValidation: z.function().optional(),
});

export type ValidationRules = z.infer<typeof validationRulesSchema>;