import { BaseField } from "../type";

export interface DateField extends BaseField {
    type: 'date';
    default?: Date;
}

export const createDateField = (props: DateField): DateField => {
    return {
        ...props,
        type: 'date',
    }
}