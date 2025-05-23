import { BaseField } from "../../types";

export interface NumberFieldProps extends BaseField {
    default?: number;
    min?: number;
    max?: number;
}


export interface NumberField extends NumberFieldProps {
    type: "number";
}

export const createNumberField = (props: NumberFieldProps): NumberField => { 
    return {
        ...props,
        type: 'number',
    }
}