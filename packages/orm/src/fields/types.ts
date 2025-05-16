import { BooleanField } from "./field-types/boolean";
import { DateField } from "./field-types/date";
import { NumberField } from "./field-types/number";
import { ObjectIdField } from "./field-types/objectId";
import { StringField } from "./field-types/string";
import type { ObjectId } from "mongodb";

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'objectId' | 'object';

export type BaseField = {
    required?: boolean;
    optional?: boolean;
    unique?: boolean;
}

export interface ObjectFieldProps<T extends Record<string, MonkoField>> extends BaseField {
    schema: T;
}
export interface ObjectField<T extends Record<string, MonkoField>> extends ObjectFieldProps<T> {
    type: 'object';
}

export type MonkoField = StringField | NumberField | BooleanField | DateField | ObjectIdField | ObjectField<any>;

/**
 * Infers the actual TypeScript type (
 *   string, number, boolean, Date, ObjectId
 * ) from a given MonkoField.
 */
export type InferMonkoFieldType<F> =
  F extends StringField ? string :
  F extends NumberField ? number :
  F extends BooleanField ? boolean :
  F extends DateField ? Date :
  F extends ObjectIdField ? ObjectId :
  F extends ObjectField<infer S> ? { [K in keyof S]: InferMonkoFieldType<S[K]> } :
  F extends [infer U] ? InferMonkoFieldType<U>[] :
  never;