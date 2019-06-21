/**
 * @module Utils
 */

import { canCareAbout, EntityFilter, HasInputs, QueryGraphNode } from './types'
import { EcsGraph } from './ecs/ecsGraph'

/**
 * @description Used to only update filters if needed
 *
 * @param caresAbout - The list of component the filter cares about.
 * @param componentKeys - The keys to search for in caresAbout.
 * @returns Whether the filter need or doesnt need to be recalculated.
 */
export function filterNeedsUpdate(
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
export function composeInfluencedBy(...filters: EntityFilter[]): canCareAbout {
    const whatAllFiltersCareOf = filters.map(
        ({ caresAbout }: EntityFilter): canCareAbout => caresAbout
    )

    let caresAbout: canCareAbout = '*'

    if (!whatAllFiltersCareOf.includes('*')) {
        caresAbout = Array.from(
            new Set(
                whatAllFiltersCareOf.reduce(
                    (
                        prev: canCareAbout,
                        current: canCareAbout
                    ): canCareAbout => [...prev, ...current]
                )
            ).values()
        )
    }

    return caresAbout
}

/**
 * @description Compares 2 arrays.
 *
 * @param arr1 - The first array.
 * @param arr2 - The second array.
 * @param anyOrder - Specifies if the arrays must be in the same order.
 *
 * @returns Wheather the 2 arrays match.
 */
export function compareArrays<T>(
    arr1: T[],
    arr2: T[],
    anyOrder = false
): boolean {
    if (anyOrder) {
        arr1.sort()
        arr2.sort()
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false
        }
    }

    return true
}

/**
 * @description Removes all duplicates from array.
 *
 * @param arr - The array to remove duplicates from.
 * @returns The array containing no duplicates.
 */
export function removeDuplicates<T>(arr: T[]): T[] {
    return Array.from(new Set<T>(arr).values())
}

/**
 * @description Used to recurisvly get all inputs of a node.
 *
 * @param ecsGraph - The source of data.
 * @param node - The node to check inputs for.
 * @returns An array with all ids of the inputs.
 */
export function getInputs(ecsGraph: EcsGraph, node: HasInputs): number[] {
    const inputs = []

    for (let nodeId of node.inputsFrom) {
        const otherNode = ecsGraph.QueryGraph[nodeId]

        if (!otherNode.acceptsInputs) {
            inputs.push(nodeId)
        } else {
            inputs.push(...getInputs(ecsGraph, otherNode))
        }
    }

    return removeDuplicates(inputs)
}

export function getNodeChildren(ecsGraph: EcsGraph, ids: number[]): number[] {
    if (!ids.length) return []

    const result: number[] = [...ids]

    ids.map((id: number): QueryGraphNode => ecsGraph.QueryGraph[id]).forEach(
        (node: QueryGraphNode): void => {
            result.push(...getNodeChildren(ecsGraph, node.outputsTo))
        }
    )

    return removeDuplicates(result)
}
