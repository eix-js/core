/**
 * @module EcsGraph
 */

import { defaultEcsOptions } from '../constants'
import { IGraph, IGraphNode, INodeId } from '../../graph/classes/IGraph'
import { hashCode, LruCache } from '@eix-js/utils'
import { InfluenceTable } from '../../graph/classes/InfluenceTable'
import { entityId } from '../types/entityId'
import { Entity } from '../types/Entity'
import { ecsEvent } from '../types/entityEvent'
import { BitFieldEmitter } from './BitFieldEmitter'
import { EcsOptions } from '../types/EcsOptions'
import { NodeData } from '../types/NodeData'
import { EntityFilterInitter, EntityTest } from '../types/EntityTest'
import { Dependency } from '../types/Dependency'
import { removeEntityFromSnapshot } from '../helpers/removeEntityFromSnapshot'
import { addEntityToSnapshot } from '../helpers/addEntityToSnapshot'
import { nodeNeedsUpdate } from '../helpers/nodeNeedsUpdate'
import { setToArray } from '../helpers/setToArray'
import { compareArrays } from '../helpers/compareArrays'

export class EcsGraph {
    /**
     * @description Used to generate unique ids.
     */
    private lastId = 0

    /**
     * @description The options passed to the ecs constructor.
     */
    public options: EcsOptions

    /**
     * @description The number of events propagated
     */
    public eventCount = 0

    /**
     * @description Object holding all entities.
     */
    public entities: Record<string, Entity> = {}

    /**
     * @description Table remembering what entity influences what inputs.
     */
    private infulenceTable = new InfluenceTable()

    /**
     * @description The computation graph of the ecs.
     */
    public QueryGraph = new IGraph<NodeData>()

    public emitter = new BitFieldEmitter<Entity[]>(4)

    public constructor(options: Partial<EcsOptions> = {}) {
        const result = { ...defaultEcsOptions, ...options }

        this.options = result
    }

    /**
     * @description Used to generate an unque id
     *
     * @returns The new id.
     */
    public getId(): number {
        const id = this.lastId++

        return id
    }

    private updateComplexNode(
        entityId: number,
        node: IGraphNode<NodeData>,
        estimation = true
    ): this {
        if (node && !node.input) {
            if (node.data.snapshot.has(entityId) && !estimation) {
                node.data.snapshot.delete(entityId)
            } else if (estimation !== false) {
                let shouldAddEntity = true

                for (const inputNode of node.previous) {
                    if (!inputNode.data.snapshot.has(entityId)) {
                        removeEntityFromSnapshot(entityId, node)
                        shouldAddEntity = false
                        break
                    }
                }

                if (shouldAddEntity) {
                    addEntityToSnapshot(entityId, node)
                }
            }
        }

        return this
    }

    private updateInputNodes(
        entityId: entityId,
        ...componentKeys: string[]
    ): this {
        const influencednputs = this.infulenceTable.getArray(entityId)

        const nodesToUpdate = new Set<IGraphNode<NodeData>>()
        const influencedNodes = this.QueryGraph.getBulk(...influencednputs)

        const nodesWichNeedUpdate = influencedNodes.filter(node =>
            nodeNeedsUpdate(node.data.dependencies, ...componentKeys)
        )

        for (const node of nodesWichNeedUpdate) {
            const { test, cache } = node.data
            const testResult = test(entityId)

            if (testResult !== cache.get(entityId)) {
                cache.set(entityId, testResult)

                if (!testResult) {
                    removeEntityFromSnapshot(entityId, node)
                } else {
                    addEntityToSnapshot(entityId, node)
                }

                if (this.options.bulkNodeEventPropagation) {
                    for (const outputNode of node.next) {
                        nodesToUpdate.add(outputNode)
                    }
                } else {
                    for (const outputNode of node.next) {
                        this.updateComplexNode(entityId, outputNode, testResult)
                    }
                }
            }
        }

        if (this.options.bulkNodeEventPropagation && nodesToUpdate.size) {
            for (const node of nodesToUpdate.values()) {
                this.updateComplexNode(entityId, node)
            }
        }

        return this
    }

    private updateInfluenceTable(
        entityId: number,
        ...componentKeys: string[]
    ): this {
        let influencednputs = this.infulenceTable.get(entityId)

        const nodesWichMayNeedUpdate = setToArray(this.QueryGraph.inputs)
            .filter(id => !influencednputs.has(id))
            .map(id => this.QueryGraph.get(id))

        const nodes = nodesWichMayNeedUpdate.filter(node =>
            nodeNeedsUpdate(node.data.dependencies, ...componentKeys)
        )

        for (const node of nodes) {
            influencednputs.add(node.id)
        }

        return this.updateInputNodes(entityId, ...componentKeys)
    }

    /**
     * @description Used to handle an event.
     *
     * @param bits - The name of the event.
     * @param entities - The ids to use to handle the event.
     * @returns The ecs instance.
     */
    public handleEvent(bits: ecsEvent, ...entities: Entity[]): this {
        if (this.options.countEvents) this.eventCount++

        if (bits & 1) {
            // addEntity
            for (const entity of entities) {
                this.entities[entity.id] = entity
                this.infulenceTable.addInput(entity.id)
            }
        }
        if ((bits >> 1) & 1) {
            // addComponents
            for (const entity of entities) {
                // Thus merges the compoennts
                this.entities[entity.id].components = {
                    ...this.entities[entity.id].components,
                    ...entity.components
                }

                const componentKeys = Object.keys(entity.components)
                if (componentKeys.length) {
                    this.updateInfluenceTable(entity.id, ...componentKeys)
                }
            }
        }
        if ((bits >> 2) & 1) {
            // updateComponents
            for (const entity of entities) {
                const componentKeys = Object.keys(entity.components)

                const entityRef = this.entities[entity.id]

                if (entityRef) {
                    for (const key of componentKeys) {
                        if (
                            this.options.addComponentsIfTheyDontExist &&
                            entityRef.components[key] === undefined
                        ) {
                            this.handleEvent(0b10, {
                                id: entity.id,
                                components: {
                                    [key]: entity.components[key]
                                }
                            })
                        }

                        if (this.options.setComponentOnUpdate) {
                            entityRef.components[key] = entity.components[key]
                        }
                    }
                }

                if (componentKeys.length) {
                    this.updateInputNodes(entity.id, ...componentKeys)
                }
            }
        }
        if ((bits >> 3) & 1) {
            // removeEntity
            for (const { id } of entities) {
                const influences = this.infulenceTable.getArray(id)

                // this is recurisve so i made a different function
                const children = this.QueryGraph.getNodesChildren(
                    this.QueryGraph.getBulk(...influences)
                )

                for (const child of children) {
                    removeEntityFromSnapshot(id, child)
                }

                this.infulenceTable.removeInput(id)
                delete this.entities[id]
            }
        }

        this.emitter.emit(bits, entities)

        return this
    }

    /**
     * @description Used to add a node to the queryGraph
     *
     * @param filters - The filters the node must have.
     * @returns The id of the node.
     */
    public addInputNodeToQueryGraph(filter: EntityFilterInitter): number {
        const hash = hashCode(filter.key)
        const node = this.QueryGraph.get(hash)

        if (node) return node.id

        const snapshot = new Set<number>()

        for (const { id, components } of this.allEntities) {
            if (
                nodeNeedsUpdate(filter.dependencies, ...Object.keys(components))
            ) {
                this.infulenceTable.get(id).add(hash)

                if (filter.test(id)) {
                    snapshot.add(id)
                }
            }
        }

        const { test, dependencies } = filter

        this.QueryGraph.addNode(
            ...this.createNode({
                input: true,
                hash,
                dependencies,
                snapshot,
                test
            })
        )

        return hash
    }

    public addComplexNode(...inputHashes: number[]): number {
        const inputNodes = this.QueryGraph.getBulk(...inputHashes)

        const maxDepthInputs = this.QueryGraph.getInputs({
            previous: new Set(inputNodes)
        })

        for (const node of this.QueryGraph.nodes.values()) {
            if (node.input) continue

            if (
                compareArrays(
                    maxDepthInputs,
                    this.QueryGraph.getInputs(node),
                    true
                )
            ) {
                return node.id
            }
        }

        const hash = hashCode(`Ecs-${this.lastId++}`)
        const entityIdMap = new Map<number, number>()

        const snapshot = new Set<number>()

        for (const node of inputNodes) {
            for (const entityId of node.data.snapshot) {
                let count = entityIdMap.get(entityId)

                if (count) {
                    entityIdMap.set(entityId, ++count)
                } else {
                    entityIdMap.set(entityId, 1)
                }

                if (count === inputHashes.length) {
                    snapshot.add(entityId)
                }
            }
        }

        this.QueryGraph.addNode(
            ...this.createNode({
                input: false,
                hash,
                inputHashes,
                snapshot
            })
        )

        return hash
    }

    public createNode({
        input,
        dependencies,
        test,
        snapshot,
        hash,
        inputHashes
    }: {
        dependencies?: Dependency
        input: boolean
        test?: EntityTest
        snapshot: Set<entityId>
        hash: INodeId
        inputHashes?: INodeId[]
    }): Parameters<IGraph<NodeData>['addNode']> {
        return [
            hash,
            input ? [] : inputHashes,
            {
                cache: new LruCache<boolean>(),
                dependencies: input ? dependencies : [],
                emitter: new BitFieldEmitter<Entity[]>(4),
                test: input ? test : null,
                snapshot
            },
            input
        ]
    }

    public get allEntities() {
        return Object.values(this.entities)
    }
}
