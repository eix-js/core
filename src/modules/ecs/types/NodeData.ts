import { BitFieldEmitter } from '../classes/BitFieldEmitter'
import { Entity } from './Entity'
import { Dependency } from './Dependency'
import { LruCache } from '@eix-js/utils'
import { IGraphNode } from '../../graph/classes/IGraph'
import { EntityTest } from './EntityTest'

/**
 * @description The base graph node used by the computation graph of the ecs class.
 */
export interface NodeData {
    dependencies: Dependency
    snapshot: Set<number>
    test: EntityTest
    cache: LruCache<boolean>
    emitter: BitFieldEmitter<Entity[]>
}

export type Node = IGraphNode<NodeData>
