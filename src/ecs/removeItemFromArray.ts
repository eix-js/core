/**
 * @description I read a gist made by the creator of rollup
 * showcasing this fast function so i decided to copy it in here.
 *
 * @param arr - The array to remove the item from.
 * @param item - The item to remove from the array.
 */
export function removeItem (arr: unknown[], item: unknown): void {
	const index = arr.indexOf(item)

	if (index !== -1) {
		arr[index] = arr[arr.length - 1]
		arr.pop()
	}
}
