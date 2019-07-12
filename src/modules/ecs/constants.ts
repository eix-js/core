/**
 * @module Defaults
 */

import { EcsOptions } from './types/EcsOptions'

export const defaultEcsOptions: EcsOptions = {
    setComponentOnUpdate: true,
    addComponentsIfTheyDontExist: true,
    cacheSize: 1000,
    countEvents: false,
    bulkNodeEventPropagation: true
}

export const eventCodes = {
    addEntity: 1,
    addComponents: 2,
    updateComponents: 4,
    removeEntity: 8
}
