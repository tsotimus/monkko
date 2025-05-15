import { BooleanField } from "./types/boolean";
import { DateField } from "./types/date";
import { NumberField } from "./types/number";
import { ObjectIdField } from "./types/objectId";
import { StringField } from "./types/string";
import type { ObjectId } from "mongodb";

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'objectId' | 'array' | 'object';

export type BaseField = {
    type: FieldType;
    required?: boolean;
    optional?: boolean;
    unique?: boolean;
}


export type MonkoField = StringField | NumberField | BooleanField | DateField | ObjectIdField;

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
  F extends [infer U] ? InferMonkoFieldType<U>[] :
  never;