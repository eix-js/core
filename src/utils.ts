/**
 * @module Utils
 */

import { canCareAbout, EntityFilter } from './types'

/**
 * @description Used to only update filters if needed
 *
 * @param caresAbout - The list of component the filter cares about.
 * @param componentKeys - The keys to search for in caresAbout.
 * @returns Whether the filter need or doesnt need to be recalculated.
 */
export function filterNeedsUpdate (
	caresAbout: canCareAbout,
	...componentKeys: string[]
): boolean {
	if (caresAbout === '*') return true
	else {
		for (const key of componentKeys) {
			if (caresAbout.includes(key)) return true
		}
	}

	return false
}

/**
 * @description Used to compute what a node is influenced by from its filters
 *
 * @param filters - The filters of the input.
 * @returns What the node is influenced by.
 */
export function composeInfluencedBy (...filters: EntityFilter[]): canCareAbout {
	const whatAllFiltersCareOf = filters.map(
		({ caresAbout }: EntityFilter): canCareAbout => caresAbout
	)

	let caresAbout: canCareAbout = '*'

	if (!whatAllFiltersCareOf.includes('*')) {
		caresAbout = Array.from(
			new Set(
				whatAllFiltersCareOf.reduce(
					(prev: canCareAbout, current: canCareAbout): canCareAbout => [
						...prev,
						...current
					]
				)
			).values()
		)
	}

	return caresAbout
}
