import { MonkoField } from "../fields/type";

/**
 * Defines the structure for a Monko schema configuration.
 * This is the input type for the `defineSchema` function.
 */
export interface SchemaDefinition {
  /** The name of the model/schema (e.g., 'User'). */
  name: string;
  /** The name of the database this schema belongs to. */
  db: string;
  /** The name of the collection in the database. */
  collection: string;
  /** An object defining the fields of the schema. Keys are field names. */
  fields: Record<string, MonkoField>;

  // TODO: Add more properties here
}


/**
 * Defines a Monko schema.
 * This function will take a schema definition, validate it,
 * and return a processed schema object that can be used by the ORM.
 *
 * @param definition The schema definition object.
 * @returns A processed Monko schema.
 */
export default function defineSchema(definition: SchemaDefinition) {
  // Implementation will be handled via Zod for schema validation.
  // TODO: Generate a Zod schema from the provided SchemaDefinition.
  throw new Error('defineSchema is not implemented. Use Zod for schema validation.');
  
}