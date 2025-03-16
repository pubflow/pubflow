// src/adapters/svelte/utils/validation.ts
import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

export function validateSchema<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return {
        success: false,
        errors
      };
    }
    throw error;
  }
}

export function isValidSchema<T>(schema: z.ZodType<T>, data: unknown): boolean {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
}