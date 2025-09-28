import { BaseField } from "../../types";
import { toObjectId } from "../../../utils";

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
        transform: toObjectId, // Automatically convert valid strings to ObjectIds
    }
}