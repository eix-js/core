import { ECS } from "./ecs";
import { Filter, key, Components } from "./interfaces";
import { idKey } from "./idKey";

interface UpdateData {
    id: number
    key: string
    value: any
}

export class ComponentTracker {
    tracked: Components[] = []

    constructor(ecs: ECS, filters: Filter[], keys: string[]) {
        let entities: key[] = [];

        ecs.on("update", (data: UpdateData) => {
            const index = entities.indexOf(data.id)
            // console.log(entities,`Updating index ${index} with value ${data.value} of key ${data.key} and id ${data.id}. ${JSON.stringify(this.tracked[index])}`)

            if (index == -1) return
            else if (keys.indexOf(data.key) == -1) return

            //update tracked
            this.tracked[index][data.key] = {
                forced: true,
                data: data.value
            }
        })

        ecs.on("change", () => {
            //get ids
            let ids: key[] = Object.keys(ecs.entities)

            //filter ids
            filters.forEach(filter => {
                ids = filter(ids, ecs)
            })

            entities = ids

            //update tracked
            this.tracked = ids.map((id: number, index: number) => {
                //get entity
                const entity = ecs.entities[id]

                //filter correct keys
                let components: Components = {}

                //iterate over keys
                for (let i in entity) {
                    if (keys.indexOf(i) != -1)
                        components[i] = entity[i]
                }

                //return if zero components
                if (!Object.keys(components).length && keys.length)
                    return null

                const handler: ProxyHandler<Components> = {
                    get: (target: Components, key: any) => {
                        if (key == idKey)
                            return parseInt(id.toString())

                        return target[key]
                    },
                    set: (target: Components, key: string, value: any) => {
                        if (value && value.forced) {
                            if (ecs.debug)
                                ecs.emit("changeResolved", { target, key, value })
                            target[key] = value.data
                        }
                        else {
                            if (ecs.debug)
                                ecs.emit("changeDetected", { target, key, value })
                            ecs.emit("update", { id, key, value })
                        }

                        return true
                    }
                }

                return new Proxy(components, handler)
            })

            // filter falsy values
            this.tracked = this.tracked.filter((value, index) => {
                if (!value)
                    entities[index] = null

                return value
            })

            //filter falsy entities
            entities = entities.filter(value => value)
        })
    }
}