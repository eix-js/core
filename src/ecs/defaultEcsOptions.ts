/**
 * @module Defaults
 */

import { EcsOptions, Entity } from './types'

export const defaultEcsOptions: EcsOptions = {
    setComponentOnUpdate: true,
    addComponentsIfTheyDontExist: true,
    cacheSize: 1000
}

export const defaultEntity: Entity = {
    id: 0,
    components: {}
}
