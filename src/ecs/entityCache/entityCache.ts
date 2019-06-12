/**
 * @module EventGrouper
 */

import { EntityCacheStore, entityActions, entityId } from '../types'

import { removeItem } from '../removeItemFromArray'
import { EntityTree } from '../entityTree/entityTree'

export class EventGrouper {
	/**
	 * @description A js list with all operations.
	 */
	private operations: entityActions[] = ['add', 'remove']

	/**
	 * @description The object where deffered operations are stored.
	 */
	private cache: EntityCacheStore = this.generateCache()

	/**
	 * @description The event emitter to emit events at the end of the tick.
	 */
	private eventEmitter: EntityTree

	/**
	 * @description The id of the last task created.
	 */
	private lastTaskId = 0

	/**
	 * @description An array with all the active tasks
	 */
	private activeTasks: number[] = []

	/**
	 * @description Specifies the number of tasks when this will auto-resolve things.
	 */
	public maxActiveStackCount: number = Infinity

	/**
	 * @description Used to only perform operations once per tick
	 *
	 * @param evenEmitter - The event emitter to emit to.
	 */
	public constructor (evenEmitter: EntityTree) {
		this.eventEmitter = evenEmitter
	}

	/**
	 * @description Generates the cache object for performing actions efficiently
	 *
	 * @returns A barebones cache object.
	 */
	private generateCache (): EntityCacheStore {
		const cache: Partial<EntityCacheStore> = {}

		for (let i of this.operations) {
			cache[i] = {
				resolver: null,
				values: []
			}
		}

		return cache as EntityCacheStore
	}

	/**
	 * @description Used to group events emitted on the same tick.
	 *
	 * @param key - The name of the event to call.
	 * @param ids - The ids to pass to the event.
	 * @returns The EntityCache object the method was called on.
	 */
	public emit (key: entityActions, ids: entityId[]): this {
		const instance = this.cache[key]

		// check for too many tasks
		if (instance.values.length >= this.maxActiveStackCount) {
			this.resolve()
		}

		// only runs if no events are curently cached
		if (!instance.resolver) {
			const taskId = this.lastTaskId++
			this.activeTasks.push(taskId)

			instance.resolver = Promise.resolve().then((): void => {
				if (this.activeTasks.includes(taskId)) {
					instance.resolver = null
					this.eventEmitter.pushData(key, instance.values)
					instance.values = []
					removeItem(this.activeTasks, taskId)
				}
			})
		}

		instance.values.push(...ids)

		return this
	}

	/**
	 * @description Used to resolve all events imediatly.
	 *
	 * @returns The EntityCache object the method was called on.
	 */
	public resolve (): this {
		for (let i of this.operations) {
			this.eventEmitter.pushData(i, this.cache[i].values)
			this.cache[i].values = []
		}

		this.activeTasks = []

		return this
	}
}
