// src/adapters/react/utils/validation.ts
import { z } from 'zod';

export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

export function isValidSchema<T>(schema: z.ZodType<T>, data: unknown): boolean {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}