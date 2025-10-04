import { z } from 'zod';
import { ObjectIdSchema } from './utils';

// Base document schema for User
export const UserSchema = z.object({
  _id: ObjectIdSchema,
  address: z.any().optional(),
  email: z.string(),
  name: z.string(),
});

// Create input schema (without _id and timestamps)
export const CreateUserSchema = UserSchema.omit({
  _id: true,
});

// Update input schema (partial of create schema)
export const UpdateUserSchema = CreateUserSchema.partial();

// Type exports inferred from Zod schemas
export type UserDocument = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
