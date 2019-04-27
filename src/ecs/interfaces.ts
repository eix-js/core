import { ECS } from "./ecs";

export interface Entities {
    [key: number]: Components
}

export interface Components {
    [key: string]: any
}

export interface Events {
    [key: string]: ((data: any) => void)[]
}

export type key = number | string
export type Filter = (ids: key[], ecs: ECS) => key[]