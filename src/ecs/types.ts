/**
 * @module Types
 */

import { LruCache } from '@eix-js/utils'
import { EventEmitter } from 'ee-ts'
import { IGraphNode } from '../modules/graph/classes/IGraph'

/**
 * @description options to be passed to the constructor of the main ecs class
 */
export interface EcsOptions {
    setComponentOnUpdate: boolean
    addComponentsIfTheyDontExist: boolean
    cacheSize: number
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
    hash: number
    test: EntityTest
    cache: LruCache<boolean>
}

export interface EntityFilterInitter {
    dependencies: Dependency
    key: string
    test: (id: number) => boolean
}

export type EcsEventMap = Record<ecsEvent, (entity: Entity[]) => void>

/**
 * @description The base graph node used by the computation graph of the ecs class.
 */
export interface NodeData {
    dependencies: Dependency
    snapshot: Set<number>
    test: EntityTest
    cache: LruCache<boolean>
    emitter: EventEmitter<EcsEventMap>
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
export type Dependency = string[] | '*' | null

export interface Event {
    name: ecsEvent
    data: Entity[]
}

/**
 * @description Operators wich can be based to .where
 */
export type operator = '==' | '!='

export type Node = IGraphNode<NodeData>
