import { z } from 'zod';
import { questionSchema } from './question';

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Section title is required'),
  description: z.string(),
  questions: z.array(questionSchema),
  isOptional: z.boolean().default(false),
  order: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  visibility: z.object({
    condition: z.string().optional(),
    dependsOn: z.array(z.string()).optional(),
  }).optional(),
});

export type Section = z.infer<typeof sectionSchema>;