import { EcsGraph } from './ecsGraph'
import { QueryGraphNode, EntityFilterInitter } from '../types'
import { ComponentExposer } from './componentExposer'

/**
 * @module QueryNode
 */

export class QueryNode {
  private ecsGraph: EcsGraph
  private parent: QueryGraphNode | undefined
  private components: ComponentExposer<Record<string, unknown>> | undefined

  public snapshot: Set<number>

  /**
   * @description A nicer interface used for querying.
   *
   * @param ecsGraph - The ecsraph object to get data from.
   * @param parent - The parent to inherit snapshots from.
   */
  public constructor(ecsGraph: EcsGraph, parent?: QueryGraphNode) {
    this.ecsGraph = ecsGraph
    this.parent = parent

    if (this.parent) {
      this.snapshot = this.parent.snapshot
    } else {
      this.snapshot = new Set<number>()
    }
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

  public pipe(filter: EntityFilterInitter, ...components: string[]): QueryNode {
    const ids = components.map((component: string): number =>
      this.ecsGraph.addInputNodeToQueryGraph({
        name: filter.name(component),
        test: filter.test(this.ecsGraph, component),
        caresAbout: [component],
        lastValues: {}
      })
    )

    if (this.parent && !ids.includes(this.parent.id)) {
      ids.push(this.parent.id)
    }

    if (ids.length === 1) {
      return new QueryNode(this.ecsGraph, this.ecsGraph.QueryGraph[ids[0]])
    } else if (ids.length > 1) {
      const complexNode = this.ecsGraph.addComplexNode(ids[0], ids[1])
      const queryNode = new QueryNode(
        this.ecsGraph,
        this.ecsGraph.QueryGraph[complexNode]
      )

      if (ids.length === 2) {
        return queryNode
      } else {
        return queryNode.flag(...components.slice(2))
      }
    }

    return this
  }

  public get<T extends Record<string, unknown>>(): ComponentExposer<T> {
    if (!this.parent) {
      throw new Error('Cannot get component on query node with no parent')
    }

    if (this.components) {
      return this.components as ComponentExposer<T>
    }
    this.components = new ComponentExposer<T>(this.ecsGraph, this.parent)
    return this.components as ComponentExposer<T>
  }
}
