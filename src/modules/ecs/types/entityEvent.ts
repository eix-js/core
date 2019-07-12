import { Entity } from './Entity'

/**
 * @description Type holding all possible events for the ecs
 */
export type ecsEvent = number

export type EcsEventMap = Record<ecsEvent, (entity: Entity[]) => void>

export interface Event {
    name: ecsEvent
    data: Entity[]
}
