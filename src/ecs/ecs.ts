/**
 * @module Ecs
 */

import {
	entityId,
	Entity,
	entityFlowEvents,
	entityActions,
	EntitySource,
	EntityFilter
} from './types'
import { EventEmitter } from 'ee-ts'
import { incrementalIdGenerator } from './incrementalIdGenerator'
import { EntityCache } from './entityCache'
import { BaseEntityFlow } from './entityFlow'

class Ecs extends EventEmitter<entityFlowEvents> implements EntitySource {
	/**
	 * @description The place where all entities are stored
	 */
	public entities = new Map<entityId, Entity>()

	/**
	 * @description The keys of the entities map (only updated on change).
	 */
	public tracked: entityId[] = []

	/**
	 * @description The function used to generate ids
	 */
	private idGenerator: () => entityId

	/**
	 * @description The place where events are cached.
	 */
	private cache: EntityCache = new EntityCache(this)

	/**
	 * Specifies wheather events should be async
	 */
	private _asyncMode: boolean

	/**
	 * @description The main class of the eix game engine.
	 *
	 * @param asyncMode - Specifies wheather events should be async.
	 * @param idGenerator - The function to generate (unique) ids.
	 */
	public constructor (asyncMode = true, idGenerator = incrementalIdGenerator()) {
		super()

		// Eslint tries killing me if i use public / private in the constructor
		// (even with the rule disabled)
		this.idGenerator = idGenerator
		this._asyncMode = asyncMode

		// setup basic events
		this.on('add', (ids: entityId[]): void => {
			ids.forEach((id: entityId): void => {
				this.entities.set(id, {})
			})

			this.tracked.push(...ids)
		})
	}

	/**
	 * @description Adds a new entity to the entity component system
	 *
	 * ### Example:
	 *```ts
	 * const id = ecs.addEntity()
	 * ```
	 *
	 * @returns The id of the new entity.
	 * @event add
	 */
	public addEntity (): entityId {
		const id = this.idGenerator()

		this.emit('add', [id])

		return id
	}

	/**
	 * @description Applies a filter to all entities.
	 *
	 * @param filter - The filter to apply to the entities.
	 * @returns An entitySource - like filtering suff.
	 */
	public pipe (filter: EntityFilter): BaseEntityFlow {
		return basicPipe(this, filter)
	}

	/**
	 * @description Used to resolve all events imediatly.
	 *
	 * @returns The Ecs object the method was called on.
	 */
	public resolve (): this {
		if (this._asyncMode) this.cache.resolve()

		return this
	}

	/**
	 * @description Emits events and caches them.
	 * If async mode is enabled. To skip the caching process, use .emitWithoutCaching.
	 *
	 * @example ```ts
	 * const ecs = new Ecs()
	 *
	 * // thats what .addEntity does under the hood
	 * ecs.entities.set(0,{})
	 * ecs.emit('add',[0])
	 * ```
	 *
	 * @param key - The name of the event to emit.
	 * @param ids - The entity ids to emit.
	 */
	public emit (key: entityActions, ids: entityId[]): void {
		if (this._asyncMode) this.cache.emit(key, ids)
		else super.emit(key, ids)
	}

	public emitWithoutCaching (key: entityActions, ids: entityId[]): this {
		const old = this._asyncMode
		this._asyncMode = false
		this.emit(key, ids)
		this._asyncMode = old

		return this
	}

	/**
	 * @description Used to get the value of the private property _asyncMode.
	 *
	 * @returns The value of the private property _asyncMode.
	 */
	public get asyncMode (): boolean {
		return this._asyncMode
	}

	/**
	 * @description Used to get the value of the private property _asyncMode.
	 *
	 * @param value - The value to set asyncMode to.
	 */
	public set asyncMode (value: boolean) {
		// force the resolving of events if switching from async to sync
		if (!value && this._asyncMode) this.resolve()

		this._asyncMode = value
	}

	/**
	 * @description Helper property to get the maxActiveStackCount
	 * from the private cache property.
	 *
	 * @returns The maxActiveStackCount of the cahce property.
	 */
	public get maxActiveStackCount (): number {
		return this.cache.maxActiveStackCount
	}

	/**
	 * @description Helper property to set the maxActiveStackCount
	 * of the private cache property.
	 *
	 * @param value - The value to set the maxActiveStackCount of the cache property to.
	 */
	public set maxActiveStackCount (value: number) {
		this.cache.maxActiveStackCount = value

		if (value >= this.cache.maxActiveStackCount && this.asyncMode) {
			this.cache.resolve()
		}
	}
}

export { Ecs }
