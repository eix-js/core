/**
 * @module Ecs
 */

import { EcsGraph } from './ecsGraph'
import { QueryNode } from './queryNode'
import { EcsOptions } from '../types/EcsOptions'
import { eventCodes } from '../constants'
import { UnTypedComponents } from '../types/Entity'

export class Ecs {
    public ecsGraph: EcsGraph
    public all: QueryNode

    /**
     * @description Nicer interface for the ecs graoh.
     *
     * @param options - The options to pass to the EcsGraph construcotor.
     */
    public constructor(options: Partial<EcsOptions> = {}) {
        this.ecsGraph = new EcsGraph(options)
        this.all = new QueryNode(this.ecsGraph)
    }

    public addEntity<T>(components: T): number {
        const id = this.ecsGraph.getId()

        this.ecsGraph.handleEvent(
            // those are numbers so we can just add them,
            eventCodes.addEntity + eventCodes.addComponents,
            {
                id,
                components: components as UnTypedComponents
            }
        )

        return id
    }

    public removeEntity(id: number): this {
        this.ecsGraph.handleEvent(eventCodes.removeEntity, {
            id,
            components: {}
        })

        return this
    }

    public get count(): number {
        return this.ecsGraph.allEntities.length
    }
}
