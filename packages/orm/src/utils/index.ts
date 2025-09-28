import { ObjectId } from "mongodb";

/**
 * Check if a value is a valid MongoDB ObjectId.
 * @param value - The value to check.
 * @returns True if the value is a valid ObjectId, false otherwise.
 */
export const isObjectId = (value: string | number | ObjectId | Uint8Array): boolean => {
    return ObjectId.isValid(value);
}

/**
 * Convert a string to ObjectId if it's a valid ObjectId string.
 * @param value - The string value to convert to ObjectId
 * @returns ObjectId if valid string
 * @throws Error if the string is not a valid ObjectId
 */
export const toObjectId = (value: string): ObjectId => {
    if (!ObjectId.isValid(value)) {
        throw new Error(`Invalid ObjectId string: ${value}`);
    }
    return new ObjectId(value);
}