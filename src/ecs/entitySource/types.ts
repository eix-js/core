import { entityId } from '../types'
import { EventEmitter } from 'ee-ts'
import { entityFlowEvents } from '../entityCache'

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

/**
 * @description The basic interface any Component / Entity flowgroup needs to implement
 */
export interface EntitySource extends EntityFlowOutput {
	tracked?: entityId[];

	pipe(filter: EntityFilter): EntitySource;
}
