import { BaseField } from "../../types";


export interface StringFieldProps extends BaseField {
    default?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: string[];
}

export interface StringField extends StringFieldProps {
    type: "string";
}

export const createStringField = (props: StringFieldProps): StringField => {
    return {
        ...props,
        type: 'string',
    }
}