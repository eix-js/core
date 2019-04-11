import { ECS } from "./ecs"
import { BehaviorSubject, Observable } from "rxjs";
import { ComponentMap, Component, UnfoldedComponent, TrackResults } from "./interfaces";

export class ComponentFlowGroup {

    /**
     * the tracked components 
     */
    tracked: TrackResults = []

    /**
     * used to track components
     * @param syncSource the main ecs
     * @param ids the ids of the components
     * @param flowSource the minimum entity flow observable
     */
    constructor(private syncSource: ECS,
        private ids: BehaviorSubject<ComponentMap>,
        private flowSource: Observable<number[]>) {

        //give the tracker the initial value
        this.tracked = this.trackResult()

        //start tracking the components
        this.flowSource.subscribe(
            value => {
                //update it for all components
                this.tracked = this.trackResult()
            }
        )
    }

    /**
         * this wrapper is necessary or else the values in variable dont update properly
         */
    track(){
        return {
            result: this.tracked
        }
    }

    trackResult(): TrackResults {
        //unfold the component
        const unfolded = this.unfoldComponents()

        //iterate over all entities
        for (let i of unfolded)
            //iterate over all component keys
            for (let j in i)
                //proxify it
                i[j] = new Proxy(i[j], ComponentFlowGroup.handler(this.syncSource))

        //return the final component object
        return unfolded
    }

    private static handler(syncSource: ECS): ProxyHandler<Component> {
        //ignore these
        const ignoredKeys: any[] = ["data", "name", "id"]

        return {
            get: (target: any, prop: any) => {
                //handle simbols
                if (typeof prop == "symbol")
                    return JSON.stringify(target)

                //check if we should ignore the key
                if (ignoredKeys.includes(prop))
                    //if we should ignore it, than we can continue as normal
                    return target[prop]

                //if we can find the key in data
                else if (prop in target.data)
                    //than reddirect it to data
                    return target.data[prop]

                //else throw an error
                throw new Error(`
                    Cannot find property ${prop} on objcet ${JSON.stringify(target)}
                `)
            }
        }
    }

    unfoldComponents(): UnfoldedComponent[] {
        //create result array
        const result = []

        //iterate over all entity ids
        for (let i of this.ids.value.keys()) {
            //filter components
            const components: Component[] = this.syncSource.entities.get(i).filter(
                value => this.ids.value.get(i).find(component => value.id == component)
            )
            //unfold it into the object
            const componentObject: UnfoldedComponent = {}

            //iterate over all components
            for (let i of components)
                //save it into the objcet
                componentObject[i.name] = i

            //add the components to the array
            result.push(componentObject)
        }

        //return the result
        return result
    }
}