import { BaseField } from "../types";


export interface BooleanField extends BaseField {
    type: 'boolean';
    default?: boolean;
}

export const createBooleanField = (props: BooleanField): BooleanField => {
    return {
        ...props,
        type: 'boolean',
    }
}