import { Dependency } from '../types/Dependency'

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
