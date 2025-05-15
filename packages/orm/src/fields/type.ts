import { BooleanField } from "./types/boolean";
import { DateField } from "./types/date";
import { NumberField } from "./types/number";
import { ObjectIdField } from "./types/objectId";
import { StringField } from "./types/string";

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'objectId' | 'array' | 'object';

export type BaseField = {
    type: FieldType;
    required?: boolean;
    optional?: boolean;
    unique?: boolean;
}


export type MonkoField = StringField | NumberField | BooleanField | DateField | ObjectIdField;