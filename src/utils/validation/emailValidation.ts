import { z } from 'zod';

export const emailSchema = z.string().email('Please enter a valid email address');

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const result = emailSchema.safeParse(email);
  return {
    isValid: result.success,
    error: result.success ? undefined : 'Please enter a valid email address'
  };
};