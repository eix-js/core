/**
 * @module ComponentExposer
 */

import { EcsGraph } from './ecsGraph'
import { Dependency, TypedEntity, Node } from './types'

export class ComponentExposer<T> {
    private _snapshot = new Set<TypedEntity<T>>()

    /**
     * @description Used to easily acces all component of a query
     *
     * @param ecsGraph - The source of data.
     * @param node - The node to expose the components of.
     */
    public constructor(public ecsGraph: EcsGraph, public node: Node) {
        for (const id of this.ids()) {
            this.addToSnapshot(id)
        }

        this.node.data.emitter.on('addEntity', entities => {
            for (const { id } of entities) {
                this.addToSnapshot(id)
            }
        })

        this.node.data.emitter.on('removeEntity', entities => {
            for (const { id } of entities) {
                this.removeFromSnapshot(id)
            }
        })
    }

    private addToSnapshot(id: number) {
        this._snapshot.add((this.ecsGraph.entities[
            id
        ] as unknown) as TypedEntity<T>)
    }

    private removeFromSnapshot(id: number) {
        this._snapshot.delete((this.ecsGraph.entities[
            id
        ] as unknown) as TypedEntity<T>)
    }

    /**
     * @description Used to get all entities
     *
     * @returns An array with all entities.
     */
    public snapshot(): TypedEntity<T>[] {
        return Array.from(this._snapshot.values())
    }

    public ids(): number[] {
        return Array.from(this.node.data.snapshot.values())
    }

    public first(): T {
        return this.snapshot()[0].components
    }

    public each(callback: (entity: T) => boolean | Dependency | string | void) {
        for (const { components, id } of this._snapshot.values()) {
            const result = callback(components as T)

            if (result !== undefined) {
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

                this.ecsGraph.handleEvent('updateComponents', {
                    id,
                    components: changedComponents
                })
            }
        }
    }
}
