/**
 * @module Defaults
 */

import { EcsOptions, Entity } from './types'

export const defaultEcsOptions: EcsOptions = {
    setComponentOnUpdate: true,
    addComponentsIfTheyDontExist: true
}

export const defaultEntity: Entity = {
    id: 0,
    components: {}
}
