export type vector2 = [number, number]

export interface GameObject {
    position: vector2
    scale: vector2
    color: string
    gameobject: true
}

export interface RigidBody extends GameObject {
    speed: vector2
}

export interface Tile extends Record<string, unknown> {
    row: number
    column: number
    size: number
    color: string
    tile: true
}

export type playerState = 'ground' | 'sliding' | 'falling' | 'jumping'

export interface Player extends RigidBody {
    state: playerState
    gravity: Record<playerState, number>
    player: true
}

export interface Camera {
    camera: true
    speed: number
    position: vector2
}
