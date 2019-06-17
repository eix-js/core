/**
 * @module EcsGraph
 */

import { EcsOptions, Entity, QueryGraphNode, ecsEvent, EntityFilter } from '../types'
import { defaultEcsOptions, defaultEntity } from '../defaultEcsOptions'
import { filterNeedsUpdate, composeInfluencedBy, compareArrays, getInputs } from '../utils'

export class EcsGraph {
    /**
     * @description In case the groupEvents is set to true,
     * events are added here and resolved asynchronously
     */
    private eventQueue: Record<ecsEvent, Entity[]> = {
        addEntity: [],
        removeEntity: [],
        addComponents: [],
        updateComponents: []
    }

    /**
     * @description Specifies if theres already a handler for the events in the queue.
     */
    private addedResolver = false

    /**
     * @description Array with the ids of all resolvers wich still need to be called.
     */
    private activeResolvers: number[] = []

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
    private GraphInputs: number[] = []

    public constructor(options: Partial<EcsOptions> = {}) {
        const result = { ...defaultEcsOptions, ...options }

        this.options = result
    }

    /**
     * @description Used to add an entity to the ecs.
     * Be aware that if the groupEvents option is set to true,
     * this will resolve asynchronously.
     *
     * @returns The id of the new entity.
     */
    public addEntity(): number {
        const id = this.lastId++

        this.pushEventToQueue('addEntity', { ...defaultEntity, id })

        return id
    }

    /**
     * @description Resolves all event in the queue.
     *
     * @returns The ecs instance.
     */
    public resolve(): this {
        this.activeResolvers = []
        this.addedResolver = false

        for (let i in this.eventQueue) {
            // for ts to shut up
            const key = i as ecsEvent

            this.handleEvent(key, ...this.eventQueue[key])

            this.eventQueue[key] = []
        }

        return this
    }

    /**
     * @description Used to push an event in the event queue.
     *
     * @param name - The name of the event to push.
     * @param entities - The entities wich must be passed to the event handler.
     * @returns The ecs instance.
     */
    public pushEventToQueue(name: ecsEvent, ...entities: Entity[]): this {
        this.eventQueue[name].push(...entities)

        if (this.options.groupEvents) {
            if (!this.addedResolver) {
                const id = this.lastId++
                this.activeResolvers.push(id)
                this.addedResolver = true

                Promise.resolve().then((): void => {
                    if (this.activeResolvers.includes(id)) this.resolve()
                })
            }
        } else this.resolve()

        return this
    }

    private updateComplexNode(entityId: number, nodeId: number): this {
        const node = this.QueryGraph[nodeId]

        if (node && node.acceptsInputs) {
            let shouldBeAdded = true

            for (let input of node.inputsFrom) {
                const inputNode = this.QueryGraph[input]

                if (!inputNode) continue

                if (!inputNode.snapshot.has(entityId)) {
                    node.snapshot.delete(entityId)
                    shouldBeAdded = false
                    break
                }
            }

            if (shouldBeAdded) {
                node.snapshot.add(entityId)
            }
        }

        return this
    }

    private updateInputNode(entityId: number, ...componentKeys: string[]): this {
        let influencednputs = this.entitiesToGraphInputTable[entityId]

        if (influencednputs) {
            const complexPinsToUpdate = new Set<number>()

            const influencedNodes = Array.from(influencednputs.values()).map(
                (id: number): QueryGraphNode => this.QueryGraph[id]
            )

            influencedNodes.forEach((node: QueryGraphNode): void => {
                let somethingChanged = false

                for (let filter of node.filters) {
                    if (filterNeedsUpdate(filter.caresAbout, ...componentKeys)) {
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
                            ({ lastValues: lastValue }: EntityFilter): boolean =>
                                lastValue[entityId] === false
                        )
                    ) {
                        node.snapshot.delete(entityId)
                    } else {
                        node.snapshot.add(entityId)
                    }

                    if (node.snapshot.size !== oldSize) {
                        for (let outputNode of node.outputsTo) {
                            complexPinsToUpdate.add(outputNode)
                        }
                    }
                }
            })

            if (complexPinsToUpdate.size) {
                complexPinsToUpdate.forEach((nodeId: number): void => {
                    this.updateComplexNode(entityId, nodeId)
                })
            }
        }

        return this
    }

    private afterAddingComponent(entityId: number, ...componentKeys: string[]): this {
        let influencednputs = this.entitiesToGraphInputTable[entityId]

        if (!influencednputs) {
            const newSet = new Set<number>()
            this.entitiesToGraphInputTable[entityId] = newSet
            influencednputs = newSet
        }

        this.GraphInputs.filter((id: number): boolean => !influencednputs.has(id))
            .map((id: number): QueryGraphNode => this.QueryGraph[id])
            .forEach((node: QueryGraphNode): void => {
                if (filterNeedsUpdate(node.dependencies, ...componentKeys)) {
                    influencednputs.add(node.id)
                }
            })

        return this.updateInputNode(entityId, ...componentKeys)
    }

    /**
     * @description Used to handle an event.
     *
     * @param name - The name of the event.
     * @param entities - The ids to use to handle the event.
     * @returns The ecs instance.
     */
    private handleEvent(name: ecsEvent, ...entities: Entity[]): this {
        switch (name) {
            case 'addEntity':
                entities.forEach((entity: Entity): void => {
                    this.entities[entity.id] = entity

                    const componentKeys = Object.keys(entity.components)
                    if (componentKeys.length) {
                        this.afterAddingComponent(entity.id, ...componentKeys)
                    }
                })
                break
            case 'addComponents':
                entities.forEach((entity: Entity): void => {
                    this.entities[entity.id].components = {
                        ...this.entities[entity.id].components,
                        ...entity.components
                    }

                    const componentKeys = Object.keys(entity.components)
                    if (componentKeys.length) {
                        this.afterAddingComponent(entity.id, ...componentKeys)
                    }
                })
                break
            case 'updateComponents':
                entities.forEach((entity: Entity): void => {
                    const componentKeys = Object.keys(entity.components)
                    if (componentKeys.length) {
                        this.updateInputNode(entity.id, ...componentKeys)
                    }
                })
                break
            default:
                break
        }

        return this
    }

    /**
     * @description Adds a component to an entity.
     *
     * @param id - The id of the entity.
     * @param components - The components to add to the ecs.
     * @returns The ecs instance.
     */
    public addComponentTo(id: number, components: Record<string, unknown>): this {
        this.pushEventToQueue('addComponents', {
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

        for (let id of this.GraphInputs) {
            const node = this.QueryGraph[id]
            const nodeNames = node.filters.map((filter: EntityFilter): string => filter.name)

            if (compareArrays<string>(nodeNames, names)) {
                return id
            }
        }

        const id = this.lastId++

        const caresAbout = composeInfluencedBy(...filters)

        this.QueryGraph[id] = {
            id,
            dependencies: caresAbout,
            outputsTo: [],
            inputsFrom: [],
            acceptsInputs: false,
            snapshot: new Set<number>(),
            filters
        }

        this.GraphInputs.push(id)

        return id
    }

    public addComplexNode(...inputNodes: number[]): number {
        const inputs = getInputs(this, {
            inputsFrom: inputNodes
        })

        for (let node of Object.values(this.QueryGraph)) {
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

        inputNodes
            .map((id: number): QueryGraphNode => this.QueryGraph[id])
            .forEach((node: QueryGraphNode): void => {
                node.outputsTo.push(id)

                for (let entityId of node.snapshot) {
                    if (entityIdMap[entityId]) entityIdMap[entityId]++
                    else entityIdMap[entityId] = 1
                }
            })

        const snapshot = Object.keys(entityIdMap)
            .filter((key: unknown): boolean => entityIdMap[key as number] === inputNodes.length)
            .map((value: unknown): number => value as number)

        this.QueryGraph[id] = {
            dependencies: [],
            id,
            outputsTo: [],
            inputsFrom: inputNodes,
            acceptsInputs: true,
            snapshot: new Set<number>(snapshot),
            filters: []
        }

        return id
    }

    public has(...componentKeys: string[]): this {
        this.addInputNodeToQueryGraph(
            ...componentKeys.map(
                (componentKey: string): EntityFilter => ({
                    name: `has(${componentKey})`,
                    test: (id: number): boolean => {
                        return !this.entities[id].components[componentKey]
                    },
                    caresAbout: [componentKey],
                    lastValues: {}
                })
            )
        )

        return this
    }
}
