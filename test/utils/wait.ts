/**
 * @description Wait the given amount of time.
 *
 * @param time - The number of milliseconds to wait for.
 * @returns A promise resolving after the given amount of time.
 */
function wait(time: number): Promise<void> {
    return new Promise((res): void => {
        setTimeout((): void => {
            res()
        }, time)
    })
}

export { wait }
