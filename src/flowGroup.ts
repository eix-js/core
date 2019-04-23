import { ECS } from "./ecs";
import { Filter } from "./interfaces";
import { ComponentTracker } from "./componentTracker";

export class FlowGroup {

    //used for disposing
    children: FlowGroup[] = []

    constructor(public ecs: ECS, public filters: Filter[]) { }

    pipe(filter: Filter): FlowGroup {
        //create new flowGroup
        const child = new FlowGroup(this.ecs, [...this.filters, filter])

        //save it
        this.children.push(child)

        //return it
        return child
    }

    /**
     * used to select all entities wich have a certain key
     * @param keys the component keys the entity must have
     */
    has(...keys: string[]): FlowGroup {
        return this.pipe((ids: number[], ecs: ECS) =>
            ids.filter(id => {
                //select entity
                const entity = ecs.entities[id]

                //get included keys
                const included = keys.filter(key => key in entity)

                //compare them and return the result
                return included.length == keys.length
            })
        )
    }

    /**
     * select an entity by knowing its id
     * @param entityId the id of the entity to select
     */
    is(entityId: number): FlowGroup {
        return this.pipe((ids: number[]) =>
            ids.filter(id => id == entityId)
        )
    }

    get(...params: string[]): ComponentTracker {
        //create component tracker
        const result = new ComponentTracker( this.ecs, this.has(...params).filters, params )

        //emit changes
        this.ecs.emit("change")

        //return it
        return result
    }
}

