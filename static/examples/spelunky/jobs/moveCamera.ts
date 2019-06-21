import { Ecs } from '@eix/core'
import { Camera, Player, vector2 } from '../types'

const screenSize = [window.innerWidth, window.innerHeight]

export const moveCamera = (ecs: Ecs): ((delta: number) => void) => {
    const cameras = ecs.all.flag('camera').get<Camera>()
    const players = ecs.all.flag('player').get<Player>()

    return (): void => {
        cameras.each((camera: Camera): string => {
            const player = players.first()

            const newCameraPosition = player.position.map(
                (value: number, index: number): number =>
                    value + (player.scale[index] - screenSize[index]) / 2
            )

            camera.position = camera.position.map(
                (value: number, index: number): number =>
                    value + (newCameraPosition[index] - value) / camera.speed
            ) as vector2

            return 'position'
        })
    }
}
