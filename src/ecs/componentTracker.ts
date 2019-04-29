import { ECS } from "./ecs";
import { Filter, key, Components } from "./interfaces";
import { EntityHandler } from "./componentHandler";
import { idKey } from "../idKey";

interface UpdateData {
    id: number
    key: string
    value: any
}

export class ComponentTracker {
    tracked: Components[] = []

    constructor(public ecs: ECS, public filters: Filter[], public keys: string[]) {

        //get ids
        let entities: key[] = Object.keys(ecs.entities)

        ecs.on("update", (data: UpdateData) => {
            //search for entity
            let entity = this.tracked.find(value => value[idKey] == data.id)
            
            //try addin it
            if (!entity) {
                this.tryAddingEntity(data.id)
                entity = this.tracked.find(value => value[idKey] == data.id)
            }

            if (!entity) return //if we couldnt add it then we can reutnr
            else if (keys.indexOf(data.key) == -1) return //if we dont need the data, we can return 

            //update tracked
            entity[data.key] = {
                forced: true,
                data: data.value
            }
        })

        ecs.on("newEntity", (id: number) => this.tryAddingEntity(id))

        ecs.on("entityDeleted", (id: number) => {
            //remove entity
            this.tracked = this.tracked.filter(value => value.id != id)
        })

        //filter ids
        filters.forEach(filter => {
            entities = filter(entities, ecs)
        })

        //create tracked
        this.tracked = entities
            .map((id: number) => this.registerEntity(id))
            .filter(value => value)

        // filter falsy values
        this.tracked = this.tracked.filter((value, index) => {
            if (!value)
                entities[index] = null

            return value
        })

        //filter falsy entities
        entities = entities.filter(value => value)
    }

    registerEntity(id: number) {
        //get entity
        const entity = this.ecs.entities[id]

        //filter correct keys
        let components: Components = {}

        //iterate over keys
        for (let i in entity) {
            if (this.keys.indexOf(i) != -1)
                components[i] = entity[i]
        }

        //return if zero components
        if (!Object.keys(components).length && this.keys.length)
            return null

        return new Proxy(components, EntityHandler(id, this.ecs))
    }

    tryAddingEntity(id: number) {
        //filter it (for of for returning)
        for (let filter of this.filters)
            if (!filter([id], this.ecs).length)
                return

        //create proxy and stuff
        const result = this.registerEntity(id)

        //return if not a result
        if (!result)
            return

        //try removing old thing first
        this.tracked = this.tracked.filter(value => value.id != id)

        //save it
        this.tracked.push(result)
    }
}