import { Ecs } from '@eix/core'
import { Player } from '../types'
// import { where } from '../filters/where'
import { xor } from '../utils/xor'
import { inputs } from '../inputs'

export const control = (ecs: Ecs): ((delta: number) => void) => {
    const players = ecs.all
        .flag('player')
        // .pipe(...where<playerState>('state', '!=', 'sliding'))
        .get<Player>()

    return (delta: number): void => {
        players.each((player: Player): string => {
            if (xor(inputs.left.value, inputs.right.value)) {
                const direction = inputs.right.value ? 1 : -1

                player.position[0] += direction * delta * 0.5
            }

            if (inputs.jump.value) {
                if (player.state === 'ground') {
                    player.speed[1] -= delta / 17.5
                } else {
                    player.speed[1] -= delta / 500
                }
            }

            return 'position'
        })
    }
}
