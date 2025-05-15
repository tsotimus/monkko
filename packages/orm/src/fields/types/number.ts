import { BaseField } from "../type";

export interface NumberField extends BaseField {
    type: 'number';
    default?: number;
    min?: number;
    max?: number;
}

export const createNumberField = (props: NumberField): NumberField => { 
    return {
        ...props,
        type: 'number',
    }
}