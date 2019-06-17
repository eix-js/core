import { EcsGraph } from './ecsGraph';
import { EcsOptions } from '../types';
import { QueryNode } from './queryNode';

export class Ecs {
    public ecsGraph: EcsGraph;
    public all: QueryNode;

    /**
     * @description Nicer interface for the ecs graoh.
     *
     * @param options - The options to pass to the EcsGraph construcotor.
     */
    public constructor(options: Partial<EcsOptions>) {
        this.ecsGraph = new EcsGraph(options);
        this.all = new QueryNode(this.ecsGraph);
    }

    public addEntity<T extends Record<string, unknown>>(components: T): number {
        const id = this.ecsGraph.addEntity();

        this.ecsGraph.addComponentTo(id, components);

        return id;
    }
}
