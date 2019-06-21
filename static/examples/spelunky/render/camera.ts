import { Ecs } from '@eix/core'
import { Camera, vector2 } from '../types'

export const camera = (
    ecs: Ecs,
    ctx: CanvasRenderingContext2D
): (() => void) => {
    const node = ecs.all.flag('camera')
    const tiles = node.get<Camera>()

    return (): void => {
        tiles.each((camera: Camera): false => {
            const toTranslate = camera.position.map(
                (x: number): number => -x
            ) as vector2

            ctx.translate(...toTranslate)

            return false
        })
    }
}
