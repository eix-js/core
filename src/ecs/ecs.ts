import {  Subject } from "rxjs"
import { filter, map } from "rxjs/operators"
import { entityFlowGroup } from "./entityFlowGroup"
import { Component, componentName } from "./interfaces"


export class ECS {
    readonly entities = new Map<number, Component<any>[]>()
    private readonly core = new Subject<any>()

    readonly all = new entityFlowGroup(this, this.core.pipe(
        filter(message => message == "change"),
        map(value => Array.from(this.entities.keys()))
    ))

    private lastEntity = 0
    private lastId = 0

    //methods
    has(id: number, ...names: componentName[]) {
        const entity = this.entities.get(id)

        for (let i of names)
            if (!entity.find(({ name }) => name == i))
                return false

        return true
    }
    constructor() { }

    /**
     * used to add entities to the ecs
     * @param components the entity to add
     * @returns an entityFlowGroup pointing to the added entity
     */
    addEntity(...components: Partial<Component>[]) {
        //generate the id
        const id = this.lastEntity++

        //add the new entity
        this.entities.set(id, components.map(
            (component) => this.createComponents(component)
        ))

        //emit chanes
        this.core.next("change")

        //return the entityFlowGroup
        return this.all.is(id)
    }

    /**
     * used to emit something to all entityFlowGroups. 
     * Note that the ecs object ISNT an eventEmitter
     * @param message the message to emit to all entityFlowGroups
     */
    emit(message:string) {
        this.core.next(message)
    }

    private defaultComponent(): Component {
        return {
            data: null,
            name: "component",
            id: this.lastId++
        }
    }

    /**
     * merges a component with the default
     * @param component the partial data avable
     */
    createComponents(component: Partial<Component>): Component {
        return { ...this.defaultComponent(), ...component }
    }
}