import { entityId } from '../types'

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
