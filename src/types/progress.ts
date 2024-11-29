import { z } from 'zod';

export const progressSchema = z.object({
  completedSections: z.array(z.string()),
  skippedSections: z.array(z.string()),
  currentSectionId: z.string().optional(),
  lastUpdated: z.string().datetime(),
});

export const userProgressSchema = z.object({
  userId: z.string().uuid(),
  flowId: z.string().uuid(),
  progress: progressSchema,
  responses: z.array(z.string().uuid()),
  metadata: z.object({
    startedAt: z.string().datetime(),
    lastUpdated: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    deviceInfo: z.string().optional(),
    userAgent: z.string().optional(),
  }),
});

export type Progress = z.infer<typeof progressSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;