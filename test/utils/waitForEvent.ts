import { EventEmitter } from 'ee-ts'

interface DefaultEvents<T extends unknown[]> {
	[key: string]: (...args: T) => void;
}

/**
 * @description Used to pause the execution of an async function till an event is recived
 *
 * @param target - The eventEmitter to wait on.
 * @param name - The name of the event to await.
 * @returns A promise wich resolves when the event is triggered.
 */
function waitForEvent<T extends unknown[]> (
	target: {  | EventEmitter<DefaultEvents<T>>,
	name: string
): Promise<T> {
	return new Promise((res): void => {
		target.one(name, (...args: T): void => {
			res(args)
		})
	})
}

export { waitForEvent }
