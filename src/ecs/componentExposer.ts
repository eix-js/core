/**
 * @module ComponentExposer
 */

import { EcsGraph } from './ecsGraph'
import { QueryGraphNode, canCareAbout, Entity } from '../types'

export class ComponentExposer<T extends Record<string, unknown>> {
    private ecsGraph: EcsGraph
    private node: QueryGraphNode

    /**
     * @description Used to easily acces all component of a query
     *
     * @param ecsGraph - The source of data.
     * @param node - The node to expose the components of.
     */
    public constructor(ecsGraph: EcsGraph, node: QueryGraphNode) {
        this.ecsGraph = ecsGraph
        this.node = node
    }

    /**
     * @description Used to get all entities
     *
     * @returns An array with all entities.
     */
    public snapshot(): Entity[] {
        const entities = []

        for (const id of this.node.snapshot.values()) {
            entities.push(this.ecsGraph.entities[id])
        }

        return entities
    }

    public each(callback: (entity: T) => boolean | canCareAbout | string | void) {
        this.snapshot().forEach((entity: Entity): void => {
            const result = callback(entity.components as T)

            if (this.ecsGraph.options.changeDetection === 'manual' && result !== undefined) {
                let modified: string[] = []

                if (result instanceof Array && result.length) {
                    modified = result
                } else if (typeof result === 'string' && result !== '*') {
                    modified = [result]
                } else if (result === '*' || result === true) {
                    modified = Object.keys(entity.components)
                }

                const components: Record<string, unknown> = {}

                modified.forEach((key: string): void => {
                    components[key] = true
                })

                this.ecsGraph.pushEventToQueue('updateComponents', {
                    id: entity.id,
                    components
                })
            }
        })
    }
}
