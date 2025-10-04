import { createObjectField } from './fields/field-types/object';
import type { BaseField, MonkkoField, ObjectField } from './types';

/**
 * Defines an embedded sub-document schema for reuse in other schemas.
 * Returns a function that, given optional field settings, produces an ObjectField<T>.
 */
export function defineSubDocument<const T extends Record<string, MonkkoField>>(
  schema: T
): (opts?: BaseField) => ObjectField<T> {
  return (opts) => createObjectField(schema, opts);
} 