import { z } from 'zod';
import { ObjectIdSchema } from './utils';

// Base document schema for Organisation
export const OrganisationSchema = z.object({
  _id: ObjectIdSchema,
  description: z.string().optional(),
  industry: z.string().optional(),
  name: z.string(),
  website: z.string().optional(),
});

// Create input schema (without _id and timestamps)
export const CreateOrganisationSchema = OrganisationSchema.omit({
  _id: true,
});

// Update input schema (partial of create schema)
export const UpdateOrganisationSchema = CreateOrganisationSchema.partial();

// Type exports inferred from Zod schemas
export type OrganisationDocument = z.infer<typeof OrganisationSchema>;
export type CreateOrganisationInput = z.infer<typeof CreateOrganisationSchema>;
export type UpdateOrganisationInput = z.infer<typeof UpdateOrganisationSchema>;
