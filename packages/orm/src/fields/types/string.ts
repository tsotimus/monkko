import { BaseField } from "../type";


export interface StringField extends BaseField {
    type: 'string';
    default?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: string[];
}

export const createStringField = (props: StringField): StringField => {
    return {
        ...props,
        type: 'string',
    }
}