import { createStringField } from "./types/string";
import { createNumberField } from "./types/number";
import { createBooleanField } from "./types/boolean";
import { createObjectIdField } from "./types/objectId";
import { createDateField } from "./types/date";

export const fields = {
    string: createStringField,
    number: createNumberField,
    boolean: createBooleanField,
    date: createDateField,
    objectId: createObjectIdField,
}