import { BooleanField } from "./fields/field-types/boolean";
import { DateField } from "./fields/field-types/date";
import { NumberField } from "./fields/field-types/number";
import { ObjectIdField } from "./fields/field-types/objectId";
import { StringField } from "./fields/field-types/string";
import type { ObjectId } from "mongodb";

// Re-export individual field types and their props
export type { BooleanField } from "./fields/field-types/boolean";
export type { DateField, DateFieldProps } from "./fields/field-types/date";
export type { NumberField, NumberFieldProps } from "./fields/field-types/number";
export type { ObjectIdField, ObjectIdFieldProps } from "./fields/field-types/objectId";
export type { StringField, StringFieldProps } from "./fields/field-types/string";

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'objectId' | 'object';

export type BaseField = {
    required?: boolean;
    optional?: boolean;
    unique?: boolean;
    transform?: (value: string) => unknown;
}

export interface ObjectFieldProps<T extends Record<string, MonkkoField>> extends BaseField {
    schema: T;
}
export interface ObjectField<T extends Record<string, MonkkoField>> extends ObjectFieldProps<T> {
    type: 'object';
}

export type MonkkoField = StringField | NumberField | BooleanField | DateField | ObjectIdField | ObjectField<Record<string, MonkkoField>>;

/**
 * Infers the actual TypeScript type (
 *   string, number, boolean, Date, ObjectId
 * ) from a given MonkkoField.
 */
export type InferMonkkoFieldType<F> =
  F extends StringField ? string :
  F extends NumberField ? number :
  F extends BooleanField ? boolean :
  F extends DateField ? Date :
  F extends ObjectIdField ? ObjectId :
  F extends ObjectField<infer S> ? { [K in keyof S]: InferMonkkoFieldType<S[K]> } :
  F extends [infer U] ? InferMonkkoFieldType<U>[] :
  never;