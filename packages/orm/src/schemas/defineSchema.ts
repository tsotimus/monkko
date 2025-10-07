import { MonkkoField } from "./types";

/**
 * Defines the structure for a Monkko schema configuration.
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
  fields: Record<string, MonkkoField>;
  /** Optional settings for schema. */
  // options?: {
  //   /** Automatically add and manage createdAt and updatedAt timestamps */
  //   timestamps?: boolean;
  // };
  

  // TODO: Add more properties here
}


/**
 * Defines a Monkko schema.
 * This function will take a schema definition, validate it,
 * and return a processed schema object that can be used by the ODM.
 *
 * @param definition The schema definition object.
 * @returns A processed Monkko schema.
 */
export function defineSchema<const T extends SchemaDefinition>(schema: T): T {
  return schema;
}