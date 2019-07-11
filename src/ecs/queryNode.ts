/**
 * @module QueryNode
 */

import { EcsGraph } from './ecsGraph'
import { operator, EntityTest, Node } from './types'
import { ComponentExposer } from './componentExposer'

export interface FilterConfig {
    name: (componentName: string) => string
    test: (ecs: EcsGraph, component: string) => EntityTest
}

export class QueryNode {
    private components: ComponentExposer<unknown> | undefined

    public snapshot: Set<number>

    /**
     * @description A nicer interface used for querying.
     *
     * @param ecsGraph - The ecsraph object to get data from.
     * @param parent - The parent to inherit snapshots from.
     */
    public constructor(public ecsGraph: EcsGraph, public source?: Node) {
        if (this.source) {
            this.snapshot = this.source.data.snapshot
        } else {
            this.snapshot = new Set<number>()
        }
    }

    public where<S>(
        component: string,
        operator: operator,
        value: S
    ): QueryNode {
        return this.pipe(
            {
                name: (componentName: string) =>
                    `where ${componentName} ${operator} ${value}`,
                test: (
                    ecs: EcsGraph,
                    componentName: string
                ): ((id: number) => boolean) => (id: number): boolean => {
                    if (operator === '==') {
                        return (
                            ecs.entities[id].components[componentName] === value
                        )
                    } else if (operator === '!=') {
                        return (
                            ecs.entities[id].components[componentName] !== value
                        )
                    } else {
                        return true
                    }
                }
            },
            component
        )
    }

    public flag(...components: string[]): QueryNode {
        return this.pipe(
            {
                name: (component: string): string => `flag(${component})`,
                test: (
                    ecsGraph: EcsGraph,
                    component: string
                ): ((id: number) => boolean) => (id: number): boolean => {
                    const entity = ecsGraph.entities[id]

                    if (!entity) return false

                    return !!entity.components[component]
                }
            },
            ...components
        )
    }

    public pipe(filter: FilterConfig, ...components: string[]): QueryNode {
        const ids = components.map((component: string): number =>
            this.ecsGraph.addInputNodeToQueryGraph({
                key: filter.name(component),
                test: filter.test(this.ecsGraph, component),
                dependencies: [component]
            })
        )

        // This is here to allow chaining:
        // eg: ecs.all.flag('foo').where('bar','==','5') ...
        // However, i can't do it all the times
        // because ecs.all.doesn't have a source
        if (this.source && !ids.includes(this.source.id)) {
            ids.push(this.source.id)
        }

        if (ids.length === 1) {
            return new QueryNode(
                this.ecsGraph,
                this.ecsGraph.QueryGraph.get(ids[0])
            )
        } else if (ids.length > 1) {
            const complexNode = this.ecsGraph.addComplexNode(ids[0], ids[1])
            const queryNode = new QueryNode(
                this.ecsGraph,
                this.ecsGraph.QueryGraph.get(complexNode)
            )

            if (ids.length === 2) {
                return queryNode
            } else {
                return queryNode.flag(...components.slice(2))
            }
        }

        return this
    }

    public get<T>(): ComponentExposer<T> {
        if (!this.source) {
            throw new Error('Cannot get component on query node with no parent')
        }

        if (this.components) {
            return this.components as ComponentExposer<T>
        }

        this.components = new ComponentExposer<T>(this.ecsGraph, this.source)
        return this.components as ComponentExposer<T>
    }
}
