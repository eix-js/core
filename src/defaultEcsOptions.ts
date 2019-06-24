import { EcsOptions, Entity } from './types'

export const defaultEcsOptions: EcsOptions = {
    groupEvents: false,
    changeDetection: 'manual',
    setComponentOnUpdate: true,
    addComponentsIfTheyDontExist: true
}

export const defaultEntity: Entity = {
    id: 0,
    components: {}
}
