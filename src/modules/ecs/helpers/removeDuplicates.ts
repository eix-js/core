/**
 * @description Removes all duplicates from array.
 *
 * @param arr - The array to remove duplicates from.
 * @returns The array containing no duplicates.
 */
export function removeDuplicates<T>(arr: T[]): T[] {
    return Array.from(new Set<T>(arr).values())
}
