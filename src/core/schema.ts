// src/core/schema.ts
import { z } from 'zod';

export interface SchemaDefinition {
  name: string;
  fields: Record<string, z.ZodType>;
  timestamps?: boolean;
  softDelete?: boolean;
}

export class BridgeSchema {
  private schema: z.ZodObject<any>;
  
  constructor(public definition: SchemaDefinition) {
    const baseFields = {
      id: z.string().optional(),
      ...(definition.timestamps && {
        created_at: z.string().datetime().optional(),
        updated_at: z.string().datetime().optional()
      }),
      ...(definition.softDelete && {
        deleted_at: z.string().datetime().nullable().optional()
      }),
      ...definition.fields
    };

    this.schema = z.object(baseFields);
  }

  validate(data: any) {
    return this.schema.parse(data);
  }

  partial() {
    return this.schema.partial();
  }

  extend(fields: Record<string, z.ZodType>) {
    return new BridgeSchema({
      ...this.definition,
      fields: { ...this.definition.fields, ...fields }
    });
  }
}
/*
// Example schema usage
export const userSchema = new BridgeSchema({
  name: 'user',
  fields: {
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['admin', 'user']),
    status: z.enum(['active', 'inactive']).default('active')
  },
  timestamps: true,
  softDelete: true
}); */