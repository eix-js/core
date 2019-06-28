import { Ecs } from '@eix-js/core'
import { GameObject } from '../types'

export const drawGameObjects = (
    ecs: Ecs,
    ctx: CanvasRenderingContext2D
): (() => void) => {
    const node = ecs.all.flag('gameobject')
    const tiles = node.get<GameObject>()

    return (): void => {
        tiles.each((gameObject: GameObject): false => {
            ctx.fillStyle = gameObject.color

            ctx.fillRect(
                gameObject.position[0],
                gameObject.position[1],
                ...gameObject.scale
            )

            return false
        })
    }
}
