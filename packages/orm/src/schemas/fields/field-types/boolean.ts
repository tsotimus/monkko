import { BaseField } from "../../types";


export interface BooleanFieldProps extends BaseField {
    default?: boolean;
}

export interface BooleanField extends BooleanFieldProps {
    type: 'boolean';
}

export const createBooleanField = (props: BooleanFieldProps): BooleanField => {
    return {
        ...props,
        type: 'boolean',
    }
}