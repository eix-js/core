import { Ecs } from '@eix-js/core'
import { Tile, vector2, Camera } from '../types'

const screenSize = [window.innerWidth, window.innerHeight]

export const drawTiles = (
    ecs: Ecs,
    ctx: CanvasRenderingContext2D
): (() => void) => {
    const node = ecs.all.flag('tile')
    const tiles = node.get<Tile>()
    const camera = ecs.all.flag('camera').get<Camera>()

    const efficientMode = false

    const toScreenSpace = (position: vector2): vector2 => {
        const cameraData = (camera.snapshot()[0]
            .components as unknown) as Camera
        const cameraPoition = cameraData.position

        return position.map(
            (value: number, index: number): number =>
                value - cameraPoition[index]
        ) as [number, number]
    }

    const isOnScreen = (position: vector2): boolean => {
        const screenPosition = toScreenSpace(position)

        return (
            screenPosition[0] > -50 &&
            screenPosition[1] > -50 &&
            screenPosition[0] < screenSize[0] &&
            screenPosition[1] < screenSize[1]
        )
    }

    return (): void => {
        let first = true

        tiles.each((tile: Tile): false => {
            if (!efficientMode || first) {
                first = false
                ctx.fillStyle = tile.color
            }

            const x = tile.column * tile.size
            const y = tile.row * tile.size

            if (!efficientMode || isOnScreen([x, y])) {
                ctx.fillRect(x, y, tile.size, tile.size)
            }

            return false
        })
    }
}
