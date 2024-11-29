import { z } from 'zod';

export const responseSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  userId: z.string().uuid(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.number()])),
  metadata: z.object({
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    lastUpdated: z.string().datetime(),
    timeSpent: z.number().optional(),
    deviceInfo: z.string().optional(),
    userAgent: z.string().optional(),
  }),
  status: z.enum(['in_progress', 'completed', 'abandoned']).default('in_progress'),
});

export type Response = z.infer<typeof responseSchema>;