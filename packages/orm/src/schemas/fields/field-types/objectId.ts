import { BaseField } from "../../types";

export interface ObjectIdFieldProps extends BaseField {
    default?: string;
    ref?: string; // The name of the model to reference
}

export interface ObjectIdField extends ObjectIdFieldProps {
    type: "objectId";
}

export const createObjectIdField = (props: ObjectIdFieldProps): ObjectIdField => {
    return {
        ...props,
        type: 'objectId',
    }
}