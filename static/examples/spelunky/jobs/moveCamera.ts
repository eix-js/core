import { Ecs } from '@eix-js/core'
import { Camera, Player, vector2, TilemapData } from '../types'
import { enviroment } from '../env'

export const moveCamera = (ecs: Ecs): ((delta: number) => void) => {
    const cameras = ecs.all.flag('camera').get<Camera>()
    const players = ecs.all.flag('player').get<Player>()
    const tilemaps = ecs.all.flag('tilemap').get<TilemapData>()

    return (): void => {
        cameras.each((camera: Camera): string => {
            const player = players.first()

            // @ts-ignore
            const tilemap = tilemaps.first()

            const newCameraPosition = player.position.map(
                (value: number, index: number): number => {
                    const cornerOffset =
                        (player.scale[index] - enviroment.screenSize[index]) / 2

                    const newValue = value + cornerOffset

                    if (value < -cornerOffset) return 0
                    else if (value > tilemap.size[index] + cornerOffset)
                        return tilemap.size[index] + cornerOffset * 2

                    return newValue
                }
            )

            camera.position = camera.position.map(
                (value: number, index: number): number =>
                    value + (newCameraPosition[index] - value) / camera.speed
            ) as vector2

            return 'position'
        })
    }
}
