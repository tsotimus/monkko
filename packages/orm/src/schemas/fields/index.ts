import { createStringField } from "./field-types/string";
import { createNumberField } from "./field-types/number";
import { createBooleanField } from "./field-types/boolean";
import { createObjectIdField } from "./field-types/objectId";
import { createDateField } from "./field-types/date";
import { createObjectField } from "./field-types/object";


export const fields = {
    string: createStringField,
    number: createNumberField,
    boolean: createBooleanField,
    date: createDateField,
    objectId: createObjectIdField,
    object: createObjectField,
}
