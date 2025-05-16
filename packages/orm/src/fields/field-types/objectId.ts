import { BaseField } from "../types";

export interface ObjectIdField extends BaseField {
    type: 'objectId';
    default?: string;
    ref?: string; // The name of the model to reference
}

export const createObjectIdField = (props: ObjectIdField): ObjectIdField => {
    return {
        ...props,
        type: 'objectId',
    }
}