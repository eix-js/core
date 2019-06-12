/**
 * @description Wait the given amount of time.
 *
 * @param time - The number of milliseconds to wait for.
 * @returns A promise resolving after the given amount of time.
 */
function wait (time: number): Promise<void> {
	console.log(`Waiting ${time}`)
	return new Promise((res): void => {
		console.log('inside promise')
		setTimeout((): void => {
			console.log('inside timeout')
			res()
		}, time)
	})
}

export { wait }
