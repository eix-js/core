/**
 * @module ComponentExposer
 */

import { EcsGraph } from './ecsGraph';
import { QueryGraphNode } from '../types';

export class ComponentExposer<T extends Record<string, unknown>> {
    private ecsGraph: EcsGraph;
    private node: QueryGraphNode;

    /**
     * @description Used to easily acces all component of a query
     *
     * @param ecsGraph - The source of data.
     * @param node - The node to expose the components of.
     */
    public constructor(ecsGraph: EcsGraph, node: QueryGraphNode) {
        this.ecsGraph = ecsGraph;
        this.node = node;
    }

    /**
     * @description Used to get all entities
     *
     * @returns An array with all entities.
     */
    public snapshot(): T[] {
        const entities = [];

        for (const id of this.node.snapshot.values()) {
            entities.push(this.ecsGraph.entities[id].components as T);
        }

        return entities;
    }
}
