import { Ecs } from '@eix/core'
import { Player } from '../types'

export const move = (ecs: Ecs): ((delta: number) => void) => {
    const players = ecs.all.flag('player').get<Player>()

    return (delta: number): void => {
        players.each((player: Player): string => {
            player.position = player.position.map(
                (value: number, index: number): number => {
                    return value + player.speed[index] * delta
                }
            ) as [number, number]

            return 'position'
        })
    }
}
