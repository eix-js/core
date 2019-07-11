/**
 * @module Utils
 */

import { Dependency, NodeData } from './types'
import { IGraphNode } from '../modules/graph/classes/IGraph'

/**
 * @description Used to only update filters if needed
 *
 * @param dependencies - The list of component the filter cares about.
 * @param componentKeys - The keys to search for in caresAbout.
 * @returns Whether the filter need or doesnt need to be recalculated.
 */
export function nodeNeedsUpdate(
    dependencies: Dependency,
    ...componentKeys: string[]
): boolean {
    if (dependencies === '*') return true
    else {
        for (const key of componentKeys) {
            if (dependencies.includes(key)) return true
        }
    }

    return false
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

export function addEntityToSnapshot(
    entityId: number,
    node: IGraphNode<NodeData>
) {
    node.data.snapshot.add(entityId)
    node.data.emitter.emit('addEntity', [
        {
            id: entityId,
            components: {}
        }
    ])
}

export function removeEntityFromSnapshot(
    entityId: number,
    node: IGraphNode<NodeData>
) {
    node.data.snapshot.delete(entityId)
    node.data.emitter.emit('removeEntity', [
        {
            id: entityId,
            components: {}
        }
    ])
}

export const setToArray = <T>(set: Set<T>): T[] => Array.from(set.values())
