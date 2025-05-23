import { BaseField, ObjectField, MonkoField } from '../../types';

export function createObjectField<T extends Record<string, MonkoField>>(
  schema: T,
  opts?: BaseField
): ObjectField<T> {
  return { ...opts, type: 'object', schema };
}
