/**
 * @module ComponentExposer
 */

import { EcsGraph } from './ecsGraph'
import { QueryGraphNode, canCareAbout, TypedEntity } from '../types'

export class ComponentExposer<T> {
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
    public snapshot(): TypedEntity<T>[] {
        const entities: TypedEntity<T>[] = []

        for (const id of this.ids()) {
            entities.push((this.ecsGraph.entities[
                id
            ] as unknown) as TypedEntity<T>)
        }

        return entities
    }

    public ids(): number[] {
        return Array.from(this.node.snapshot.values())
    }

    public first(): T {
        return this.snapshot()[0].components
    }

    public each(
        callback: (entity: T) => boolean | canCareAbout | string | void
    ) {
        for (const { components, id } of this.snapshot()) {
            const result = callback(components as T)

            if (
                this.ecsGraph.options.changeDetection === 'manual' &&
                result !== undefined
            ) {
                let modified: string[] = []

                if (result instanceof Array && result.length) {
                    modified = result
                } else if (typeof result === 'string' && result !== '*') {
                    modified = [result]
                } else if (result === '*' || result === true) {
                    modified = Object.keys(components)
                }

                const changedComponents: Record<string, unknown> = {}

                for (const key of modified) {
                    if (this.ecsGraph.options.setComponentOnUpdate) {
                        changedComponents[key] = (components as Record<
                            string,
                            unknown
                        >)[key]
                    } else {
                        changedComponents[key] = true
                    }
                }

                this.ecsGraph.pushEventToQueue('updateComponents', {
                    id,
                    components: changedComponents
                })
            }
        }
    }
}
