import { EcsGraph } from './ecs/ecsGraph'

/**
 * @description options to be passed to the constructor of the main ecs class
 */
export interface EcsOptions {
    groupEvents: boolean
    changeDetection: 'automatic' | 'manual'
}

/**
 * @description The base interface for entities used by the ecs class
 */
export interface Entity {
    id: number
    components: Record<string, unknown>
}

/**
 * @description Basic interface for filters
 */
export interface EntityFilter {
    name: string
    test: (id: number) => boolean
    caresAbout: canCareAbout
    lastValues: Record<number, boolean>
}

export interface EntityFilterInitter {
    name: (componentName: string) => string
    test: (ecs: EcsGraph, component: string) => (id: number) => boolean
}

export interface HasInputs {
    inputsFrom: number[]
}

/**
 * @description The base graph node used by the computation graph of the ecs class.
 */
export interface QueryGraphNode {
    caresAbout: canCareAbout
    id: number
    outputsTo: number[]
    inputsFrom: number[]
    acceptsInputs: boolean
    snapshot: Set<number>
    filters: EntityFilter[]
}

/**
 * @description The base graph node used by the computation graph of the ecs class.
 */
export interface QueryGraphComplexNode extends QueryGraphNode {
    caresAbout: []
    acceptsInputs: true
    filters: []
}

/**
 * @description Type holding all possible events for the ecs
 */
export type ecsEvent = 'removeEntity' | 'addEntity' | 'updateComponents' | 'addComponents'

/**
 * @description What components a filter / node needs to re-calculate on the change of.
 */
export type canCareAbout = string[] | '*'
