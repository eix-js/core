/**
 * @module Types
 */

import { EventEmitter } from 'ee-ts'

/**
 * The id of any entity id. Used as the keys for the map from the ecs class
 */
export type entityId = string | number

/**
 * The base interface for entities (probably proxified ost of the time)
 */
export interface Entity {
	[key: string]: unknown;
}

/**
 * @description Holds data about cached actions
 */
export interface EntityOperation {
	resolver: Promise<void> | null;
	values: entityId[];
}

/**
 * @description Union of all operations
 */
export type entityCacheOperations = 'add' | 'remove'

/**
 * @description The actual cache object. Mostly useful for the intellisense.
 */
export type EntityCacheStore = Record<entityCacheOperations, EntityOperation>

/**
 * @description The event handler type ussed by entityFlowEvents.
 */
export type entityFlowEvent = (ids: entityId[]) => void

/**
 * @description The base events for event emitters extended by entity flows.
 */
export type entityFlowEvents = Record<entityCacheOperations, entityFlowEvent>

/**
 * @description The basic structure of a filter. The name is used for optimisation purpouses.
 */
export interface EntityFilter {
	name: string;
	solve(id: entityId): boolean;
}

/**
 * @description the output of any entity flow
 */
export type EntityFlowOutput = EventEmitter<entityFlowEvents>

export interface AllowsCaching {
	emitWithoutCaching(key: entityCacheOperations, ids: entityId[]): EntitySource;
}

/**
 * @description The basic interface any Component / Entity flowgroup needs to implement
 */
export interface EntitySource extends EntityFlowOutput {
	tracked?: entityId[];

	pipe(filter: EntityFilter): EntitySource;
}

export type EntitySourceWichAllowCaching = AllowsCaching & EntitySource
