import { BaseField } from "../types";

export interface DateFieldProps extends BaseField {
    default?: Date;
}

export interface DateField extends DateFieldProps {
    type: "date";
}

export const createDateField = (props: DateFieldProps): DateField => {
    return {
        ...props,
        type: 'date',
    }
}