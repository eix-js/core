import { Ecs } from '@eix-js/core'
// import { where } from '../filters/where'
import { playerState, Player } from '../types'
import { enviroment } from '../env'

export const applyGravity = (ecs: Ecs): ((delta: number) => void) => {
    const players = ecs.all
        .flag('player')
        .where<playerState>('state', '!=', 'ground')
        .get<Player>()

    return (delta: number): void => {
        players.each((player: Player): string => {
            player.speed[1] +=
                delta *
                player.gravity[player.state] *
                enviroment.physics.gravity

            return 'speed'
        })
    }
}
