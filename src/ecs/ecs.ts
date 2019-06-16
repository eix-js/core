import { EcsGraph } from './ecsGraph'
import { EcsOptions, QueryGraphComplexNode } from '../types'

export class Ecs {
  public ecsGraph: EcsGraph

  /**
   * @description Nicer interface for the ecs graoh.
   *
   * @param options - The options to pass to the EcsGraph construcotor.
   */
  public constructor(options: Partial<EcsOptions>) {
    this.ecsGraph = new EcsGraph(options)
  }

  public flag(...components: string[]): QueryGraphComplexNode {
    const ids = components.map((component: string): number =>
      this.ecsGraph.addInputNodeToQueryGraph({
        name: `flag(${component})`,
        test: (id: number): boolean => {
          const entity = this.ecsGraph.entities[id]

          if (!entity) return false

          return !!entity.components[component]
        },
        caresAbout: [component],
        lastValues: {}
      })
    )

    const complexNode = this.ecsGraph.addComplexNode(...ids)

    return this.ecsGraph.QueryGraph[complexNode] as QueryGraphComplexNode
  }

  public addEntity<T extends Record<string, unknown>>(components: T): number {
    const id = this.ecsGraph.addEntity()

    this.ecsGraph.addComponentTo(id, components)

    return id
  }
}

console.log('testing husky2')
