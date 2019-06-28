/**
 * @module Types
 */

import { EcsGraph } from './ecsGraph'
import { EventEmitter } from 'ee-ts'

/**
 * @description options to be passed to the constructor of the main ecs class
 */
export interface EcsOptions {
    setComponentOnUpdate: boolean
    addComponentsIfTheyDontExist: boolean
}

export interface TypedEntity<T> {
    id: number
    components: T
}

export type UnTypedComponents = Record<string, unknown>

/**
 * @description The base interface for entities used by the ecs class
 */
export type Entity = TypedEntity<UnTypedComponents>

export type EntityTest = (id: number) => boolean

/**
 * @description Basic interface for filters
 */
export interface EntityFilter {
    name: string
    test: EntityTest
    dependencies: CanBeInfluencedBy
    lastValues: Record<number, boolean>
}

export interface EntityFilterInitter {
    name: (componentName: string) => string
    test: (ecs: EcsGraph, component: string) => (id: number) => boolean
}

export type EcsEventMap = Record<ecsEvent, (entity: Entity[]) => void>

export interface HasInputs {
    inputsFrom: number[]
}

/**
 * @description The base graph node used by the computation graph of the ecs class.
 */
export interface QueryGraphNode extends HasInputs {
    dependencies: CanBeInfluencedBy
    id: number
    outputsTo: number[]
    acceptsInputs: boolean
    snapshot: Set<number>
    filters: EntityFilter[]
    emitter: EventEmitter<EcsEventMap>
}

/**
 * @description The base graph node used by the computation graph of the ecs class.
 */
export interface QueryGraphComplexNode extends QueryGraphNode {
    dependencies: []
    acceptsInputs: true
    filters: []
}

/**
 * @description Type holding all possible events for the ecs
 */
export type ecsEvent =
    | 'removeEntity'
    | 'addEntity'
    | 'updateComponents'
    | 'addComponents'

/**
 * @description What components a filter / node needs to re-calculate on the change of.
 */
export type CanBeInfluencedBy = string[] | '*'

export interface Event {
    name: ecsEvent
    data: Entity[]
}

/**
 * @description Operators wich can be based to .where
 */
export type operator = '==' | '!='
