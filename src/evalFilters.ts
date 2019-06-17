import { EntityFilter } from './types';

/**
 * @description Ecaluates an array of filters on an id.
 *
 * @param id - The id to test against.
 * @param filters - The array of filters to test with.
 * @returns The result of the evaluation.
 */
export function evalFilters(id: number, ...filters: EntityFilter[]): boolean {
    for (let filter of filters) {
        if (!filter.test(id)) {
            return false;
        }
    }

    return true;
}
