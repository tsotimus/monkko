import { ObjectId } from "mongodb";

/**
 * Check if a value is a valid MongoDB ObjectId.
 * @param value - The value to check.
 * @returns True if the value is a valid ObjectId, false otherwise.
 */
export const isObjectId = (value: string | number | ObjectId | Uint8Array): boolean => {
    return ObjectId.isValid(value);
}