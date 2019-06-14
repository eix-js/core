/**
 * @module Ecs
 */
import merge from 'deepmerge'
import {
	EcsOptions,
	Entity,
	QueryGraphNode,
	ecsEvent,
	EntityFilter
} from './types'
import { defaultEcsOptions, defaultEntity } from './defaultEcsOptions'
import { filterNeedsUpdate, composeInfluencedBy } from './utils'

export class Ecs {
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
	private options: EcsOptions

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
	private QueryGraph: Record<number, QueryGraphNode> = {}

	/**
	 * @description Holds the ids of all inputs to QueryGraph.
	 */
	private GraphInputs: number[] = []

	public constructor (options: Partial<EcsOptions> = {}) {
		const result = merge<EcsOptions>(defaultEcsOptions, options)

		this.options = result
	}

	/**
	 * @description Used to add an entity to the ecs.
	 * Be aware that if the groupEvents option is set to true,
	 * this will resolve asynchronously.
	 *
	 * @returns The id of the new entity.
	 */
	public addEntity (): number {
		const id = this.lastId++

		this.pushEventToQueue('addEntity', { ...defaultEntity, id })

		return id
	}

	/**
	 * @description Resolves all event in the queue.
	 *
	 * @returns The ecs instance.
	 */
	public resolve (): this {
		this.activeResolvers = []
		this.addedResolver = false

		for (let i in this.eventQueue) {
			// for ts to shut up
			const key = i as ecsEvent

			this.hanleEvent(key, ...this.eventQueue[key])

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
	private pushEventToQueue (name: ecsEvent, ...entities: Entity[]): this {
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

	private afterUpdatingComponent (
		entityId: number,
		...componentKeys: string[]
	): this {
		let influencednputs = this.entitiesToGraphInputTable[entityId]

		if (influencednputs) {
			const influencedNodes = Array.from(influencednputs.values()).map(
				(id: number): QueryGraphNode => this.QueryGraph[id]
			)

			influencedNodes.forEach((node: QueryGraphNode): void => {
				let somethingChanged = false

				for (let filter of node.filters) {
					if (filterNeedsUpdate(filter.caresAbout, ...componentKeys)) {
						const testResult = filter.test(entityId)

						if (testResult !== filter.lastValue) {
							filter.lastValue = testResult
							somethingChanged = true
						}
					}
				}

				if (somethingChanged) {
					if (
						node.filters.find(
							({ lastValue }: EntityFilter): boolean => lastValue === false
						)
					) {
						node.snapshot.delete(entityId)
					} else {
						node.snapshot.add(entityId)
					}
				}
			})
		}

		return this
	}

	private afterAddingComponent (
		entityId: number,
		...componentKeys: string[]
	): this {
		let influencednputs = this.entitiesToGraphInputTable[entityId]

		if (!influencednputs) {
			const newSet = new Set<number>()
			this.entitiesToGraphInputTable[entityId] = newSet
			influencednputs = newSet
		}

		this.GraphInputs.filter((id: number): boolean => !influencednputs.has(id))
			.map((id: number): QueryGraphNode => this.QueryGraph[id])
			.forEach((node: QueryGraphNode): void => {
				if (filterNeedsUpdate(node.caresAbout, ...componentKeys)) {
					influencednputs.add(node.id)
				}
			})

		return this.afterUpdatingComponent(entityId, ...componentKeys)
	}

	/**
	 * @description Used to handle an event.
	 *
	 * @param name - The name of the event.
	 * @param entities - The ids to use to handle the event.
	 * @returns The ecs instance.
	 */
	private hanleEvent (name: ecsEvent, ...entities: Entity[]): this {
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
	public addComponentTo (id: number, components: Record<string, unknown>): this {
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
	 * @returns The ecs instance.
	 */
	public addInputNodeToQueryGraph (...filters: EntityFilter[]): this {
		const id = this.lastId++

		const caresAbout = composeInfluencedBy(...filters)

		this.QueryGraph[id] = {
			id,
			caresAbout,
			outputsTo: [],
			inputsFrom: [],
			acceptsInputs: false,
			snapshot: new Set<number>(),
			filters
		}

		this.GraphInputs.push(id)

		return this
	}

	public addComplexNode (
		inputNodes: number[],
		...filters: EntityFilter[]
	): number {
		const id = this.lastId++

		const caresAbout = composeInfluencedBy(...filters)

		this.QueryGraph[id] = {
			caresAbout,
			id,
			outputsTo: [],
			inputsFrom: inputNodes,
			acceptsInputs: true,
			snapshot: new Set<number>(),
			filters
		}

		inputNodes
			.map((id: number): QueryGraphNode => this.QueryGraph[id])
			.forEach((node: QueryGraphNode): void => {
				node.outputsTo.push(id)
			})

		return id
	}

	public has (...componentKeys: string[]): this {
		this.addInputNodeToQueryGraph(
			...componentKeys.map(
				(componentKey: string): EntityFilter => ({
					name: `has(${componentKey})`,
					test: (id: number): boolean => {
						return !this.entities[id].components[componentKey]
					},
					caresAbout: [componentKey],
					lastValue: false
				})
			)
		)

		return this
	}
}
