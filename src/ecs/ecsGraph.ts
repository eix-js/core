/**
 * @module EcsGraph
 */

import { EventEmitter } from 'ee-ts'

import {
    EcsOptions,
    Entity,
    QueryGraphNode,
    ecsEvent,
    EntityFilter,
    UnTypedComponents,
    EcsEventMap
} from './types'
import { defaultEcsOptions, defaultEntity } from './defaultEcsOptions'
import {
    filterNeedsUpdate,
    composeInfluencedBy,
    compareArrays,
    getInputs,
    getNodeChildren,
    addEntityToSnapshot,
    removeEntityFromSnapshot
} from './utils'

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
     * @description Object holding all entities.
     */
    public entities: Record<string, Entity> = {}

    /**
     * @description Table remembering what entity influences what inputs.
     */
    private entitiesToGraphInputTable: Record<number, Set<number>> = {}

    /**
     * @description The computation graph of the ecs.
     */
    public QueryGraph: Record<number, QueryGraphNode> = {}

    /**
     * @description Holds the ids of all inputs to QueryGraph.
     */
    private graphInputs: number[] = []

    public emitter = new EventEmitter<EcsEventMap>()

    public constructor(options: Partial<EcsOptions> = {}) {
        const result = { ...defaultEcsOptions, ...options }

        this.options = result
    }

    /**
     * @description Used to add an entity to the ecs.
     *
     * @returns The id of the new entity.
     */
    public addEntity(): number {
        const id = this.lastId++

        this.handleEvent('addEntity', { ...defaultEntity, id })

        return id
    }

    private updateComplexNode(entityId: number, nodeId: number): this {
        const node = this.QueryGraph[nodeId]

        if (node && node.acceptsInputs) {
            let shouldAddEntity = true

            for (const input of node.inputsFrom) {
                const inputNode = this.QueryGraph[input]

                if (!inputNode) continue

                if (!inputNode.snapshot.has(entityId)) {
                    removeEntityFromSnapshot(entityId, node)
                    shouldAddEntity = false
                    break
                }
            }

            if (shouldAddEntity) {
                addEntityToSnapshot(entityId, node)
            }
        }

        return this
    }

    private updateInputNodes(
        entityId: number,
        ...componentKeys: string[]
    ): this {
        const influencednputs = this.entitiesToGraphInputTable[entityId]

        if (influencednputs) {
            const nodesToUpdate = new Set<number>()

            const influencedNodes = Array.from(influencednputs.values()).map(
                (id: number): QueryGraphNode => this.QueryGraph[id]
            )

            for (const node of influencedNodes) {
                let somethingChanged = false

                for (const filter of node.filters) {
                    if (
                        filterNeedsUpdate(filter.dependencies, ...componentKeys)
                    ) {
                        const testResult = filter.test(entityId)

                        if (testResult !== filter.lastValues[entityId]) {
                            filter.lastValues[entityId] = testResult
                            somethingChanged = true
                        }
                    }
                }

                if (somethingChanged) {
                    const oldSize = node.snapshot.size

                    if (
                        node.filters.find(
                            ({ lastValues }: EntityFilter): boolean =>
                                lastValues[entityId] === false
                        )
                    ) {
                        removeEntityFromSnapshot(entityId, node)
                    } else {
                        addEntityToSnapshot(entityId, node)
                    }

                    if (node.snapshot.size !== oldSize) {
                        for (const outputNode of node.outputsTo) {
                            nodesToUpdate.add(outputNode)
                        }
                    }
                }
            }

            if (nodesToUpdate.size) {
                for (const id of nodesToUpdate) {
                    this.updateComplexNode(entityId, id)
                }
            }
        }

        return this
    }

    private updateInfluenceTable(
        entityId: number,
        ...componentKeys: string[]
    ): this {
        let influencednputs = this.entitiesToGraphInputTable[entityId]

        if (!influencednputs) {
            const newSet = new Set<number>()
            this.entitiesToGraphInputTable[entityId] = newSet
            influencednputs = newSet
        }

        const nodes = this.graphInputs
            .filter((id: number): boolean => !influencednputs.has(id))
            .map((id: number): QueryGraphNode => this.QueryGraph[id])

        for (const node of nodes) {
            if (filterNeedsUpdate(node.dependencies, ...componentKeys)) {
                influencednputs.add(node.id)
            }
        }

        return this.updateInputNodes(entityId, ...componentKeys)
    }

    /**
     * @description Used to handle an event.
     *
     * @param name - The name of the event.
     * @param entities - The ids to use to handle the event.
     * @returns The ecs instance.
     */
    public handleEvent(name: ecsEvent, ...entities: Entity[]): this {
        switch (name) {
            case 'addEntity':
                for (const entity of entities) {
                    this.entities[entity.id] = entity

                    const componentKeys = Object.keys(entity.components)
                    if (componentKeys.length) {
                        this.updateInfluenceTable(entity.id, ...componentKeys)
                    }
                }
                break
            case 'addComponents':
                for (const entity of entities) {
                    this.entities[entity.id].components = {
                        ...this.entities[entity.id].components,
                        ...entity.components
                    }

                    const componentKeys = Object.keys(entity.components)
                    if (componentKeys.length) {
                        this.updateInfluenceTable(entity.id, ...componentKeys)
                    }
                }
                break
            case 'updateComponents':
                for (const entity of entities) {
                    const componentKeys = Object.keys(entity.components)

                    const entityRef = this.entities[entity.id]

                    if (entityRef) {
                        for (const key of componentKeys) {
                            if (
                                this.options.addComponentsIfTheyDontExist &&
                                entityRef.components[key] === undefined
                            ) {
                                this.handleEvent('addComponents', {
                                    id: entity.id,
                                    components: {
                                        [key]: entity.components[key]
                                    }
                                })
                            }

                            if (this.options.setComponentOnUpdate) {
                                entityRef.components[key] =
                                    entity.components[key]
                            }
                        }
                    }

                    if (componentKeys.length) {
                        this.updateInputNodes(entity.id, ...componentKeys)
                    }
                }
                break
            case 'removeEntity':
                for (const { id } of entities) {
                    const influences = this.entitiesToGraphInputTable[id]
                    let ids = influences ? Array.from(influences.values()) : []

                    // this is recurisve so i made a different function
                    const children = getNodeChildren(this, ids).map(
                        (id: number): QueryGraphNode => this.QueryGraph[id]
                    )

                    for (const child of children) {
                        removeEntityFromSnapshot(id, child)

                        for (const { lastValues } of child.filters) {
                            delete lastValues[id]
                        }
                    }

                    delete this.entities[id]
                }
            default:
                break
        }

        this.emitter.emit(name, entities)

        return this
    }

    /**
     * @description Adds a component to an entity.
     *
     * @param id - The id of the entity.
     * @param components - The components to add to the ecs.
     * @returns The ecs instance.
     */
    public addComponentTo<T extends UnTypedComponents>(
        id: number,
        components: T
    ): this {
        this.handleEvent('addComponents', {
            id: id,
            components
        })

        return this
    }

    /**
     * @description Used to add a node to the queryGraph
     *
     * @param filters - The filters the node must have.
     * @returns The id of the node.
     */
    public addInputNodeToQueryGraph(...filters: EntityFilter[]): number {
        const names = filters.map((filter: EntityFilter): string => filter.name)

        for (const id of this.graphInputs) {
            const node = this.QueryGraph[id]
            const nodeNames = node.filters.map(
                (filter: EntityFilter): string => filter.name
            )

            if (compareArrays<string>(nodeNames, names)) {
                return id
            }
        }

        const id = this.lastId++

        const influencedBy = composeInfluencedBy(...filters)
        const snapshot = new Set<number>()

        for (const entity of this.allEntities) {
            if (
                filterNeedsUpdate(
                    influencedBy,
                    ...Object.keys(entity.components)
                )
            ) {
                let good = true

                this.entitiesToGraphInputTable[entity.id].add(id)

                for (const filter of filters) {
                    const result = filter.test(entity.id)
                    filter.lastValues[entity.id] = result

                    if (!result) {
                        good = false
                        continue
                    }
                }

                if (good) {
                    snapshot.add(entity.id)
                }
            }
        }

        this.QueryGraph[id] = {
            id,
            dependencies: influencedBy,
            outputsTo: [],
            inputsFrom: [],
            acceptsInputs: false,
            snapshot,
            filters,
            emitter: new EventEmitter<EcsEventMap>()
        }

        this.graphInputs.push(id)

        return id
    }

    public addComplexNode(...inputNodes: number[]): number {
        const inputs = getInputs(this, {
            inputsFrom: inputNodes
        })

        for (const node of Object.values(this.QueryGraph)) {
            if (!node.acceptsInputs) continue

            if (
                compareArrays(
                    inputs,
                    getInputs(this, {
                        inputsFrom: this.QueryGraph[node.id].inputsFrom
                    }),
                    true
                )
            ) {
                return node.id
            }
        }

        const id = this.lastId++
        const entityIdMap: Record<number, number> = {}

        const nodes = inputNodes.map(id => this.QueryGraph[id])

        for (const node of nodes) {
            node.outputsTo.push(id)

            for (const entityId of node.snapshot) {
                if (entityIdMap[entityId]) entityIdMap[entityId]++
                else entityIdMap[entityId] = 1
            }
        }

        const snapshot = Object.keys(entityIdMap)
            .filter(
                (key: unknown): boolean =>
                    entityIdMap[key as number] === inputNodes.length
            )
            .map((value: unknown): number => value as number)

        this.QueryGraph[id] = {
            dependencies: [],
            id,
            outputsTo: [],
            inputsFrom: inputNodes,
            acceptsInputs: true,
            snapshot: new Set<number>(snapshot),
            filters: [],
            emitter: new EventEmitter<EcsEventMap>()
        }

        return id
    }

    public remove(id: number): this {
        this.handleEvent('removeEntity', {
            id,
            components: {}
        })

        return this
    }

    public get allEntities() {
        return Object.values(this.entities)
    }
}
