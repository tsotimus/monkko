import { BaseField, ObjectField, MonkkoField } from '../../types';

export function createObjectField<T extends Record<string, MonkkoField>>(
  schema: T,
  opts?: BaseField
): ObjectField<T> {
  return { ...opts, type: 'object', schema };
}
