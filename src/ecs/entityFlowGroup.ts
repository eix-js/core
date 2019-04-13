import { Observable, BehaviorSubject, Subscription } from "rxjs"
import { map, take } from "rxjs/operators"
import { ECS } from "./ecs"
import { componentName, ComponentMap, Component } from "./interfaces";
import { ComponentFlowGroup } from "./componentFlowGroup";

export class entityFlowGroup {
    /**
     * used to prevent memory leaks
     */
    subscriptions: Subscription[] = []

    /**
     * used to make searching components easier
     * @param syncSource the source to sync the data to
     * @param flowSource the observable wch provide entity ids
     */
    constructor(private syncSource: ECS, private flowSource: Observable<number[]>) { }
    /**
     * used to filter only the entities wich have the specified components
     * @param names the list of components names the enities need to have
     * @returns the enitityFlowGroup only letting the entities wih have
     * the specified component names trough
     */
    has(...names: componentName[]): entityFlowGroup {
        return new entityFlowGroup(this.syncSource,
            //the new observable is just the old one piped
            this.flowSource.pipe(
                //this is the part where the entities get filtered
                map(values => values.filter(id => this.syncSource.has(id, ...names)))));
    }
    /**
     * used to point to a specific entity
     * @param id the id of the entity to point to
     */
    is(id: number): entityFlowGroup {
        return new entityFlowGroup(this.syncSource, this.flowSource.pipe(map(values => values.filter(entityId => entityId == id))));
    }

    /**
     * Used to add a component to all entities selected
     * @param components the components to add
     */
    addComponents(...components: Partial<Component<any>>[]) {
        //create the components and stuff
        const componentResults = this.syncSource.formComponents(...components)

        //update it at the next change
        const subscription = this.flowSource.pipe(
            take(1)
        ).subscribe((ids) => {
            //iterate over all ids
            ids.forEach(id => {
                //appnd components
                this.syncSource.entities.get(id).push(...componentResults)
            })
        })

        //emit the change
        this.syncSource.emit("change")
    }

    /**
     * used to clear all subscriptions
     */
    dispose() {
        //unsubscribe from everything
        this.subscriptions.forEach(value => value.unsubscribe())
    }

    get(...names: componentName[]): ComponentFlowGroup {
        //create subject
        const subject = new BehaviorSubject<ComponentMap>(new Map())

        //subscirbe to the flowsource to get all ids
        const subscription = this.flowSource.subscribe((values) => {
            //create result map
            const result = new Map()

            //iterate trough all entity keys
            for (let i of values) {
                //get entity
                const entity = this.syncSource.entities.get(i)

                //filter its components
                const components = entity.filter(
                    value => names.includes(value.name)
                )

                //get the ids
                const ids = components.map(
                    value => value.id
                )

                //finally set it into the map
                result.set(i, ids)
            }

            //emit it to the subject
            subject.next(result)
        })

        //save subscriptions for later disposing
        this.subscriptions.push(subscription)

        //call change once to get the first set of result
        this.syncSource.emit("change")

        //return the component group
        return new ComponentFlowGroup(this.syncSource, subject, this.flowSource)
    }
}




