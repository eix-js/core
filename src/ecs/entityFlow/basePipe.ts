/**
 * @module BasicPipe
 */

import { EntityFilter, EntityFlowOutput } from '../types'
import { BaseEntityFlow } from './baseEntityFlow'

/**
 * @description Handles the basic id filtering.
 *
 * @param input - The source of id to pass forward.
 * @param filter - The filter to apply to ids.
 * @returns A new entity flow containg the fitered ids.
 */
export function basicPipe (
	input: EntityFlowOutput,
	filter: EntityFilter
): BaseEntityFlow {
	return new BaseEntityFlow(input, filter)
}
