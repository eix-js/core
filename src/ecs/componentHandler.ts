import { Components } from "./interfaces";
import { idKey, isProxyKey } from "../idKey";
import { ECS } from "./ecs";

export const EntityHandler = (id: number, ecs: ECS): ProxyHandler<Components> => ({
    get: (target: Components, key: any) => {
        //handle id request
        if (key === idKey)
            return parseInt(id.toString())

        //handle isProxy request
        else if (key === isProxyKey)
            return true

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
})