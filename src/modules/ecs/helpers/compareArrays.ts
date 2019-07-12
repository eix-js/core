/**
 * @description Compares 2 arrays.
 *
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @param anyOrder - Specifies if the arrays must be in the same order.
 *
 * @returns Wheather the 2 arrays match.
 */
export function compareArrays<T>(
    arr1: T[],
    arr2: T[],
    anyOrder = false
): boolean {
    if (anyOrder) {
        arr1.sort()
        arr2.sort()
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false
        }
    }

    return true
}
