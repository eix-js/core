import { Ecs } from '@eix-js/core'
import { Player, Tile } from '../types'
import {
    flatLineIntersection,
    pointOnFlatLine
} from '../utils/1dLineIntersection'

export const collide = (ecs: Ecs): ((delta: number) => void) => {
    const players = ecs.all.flag('player').get<Player>()
    const tiles = ecs.all.flag('tile').get<Tile>()

    return (): void => {
        players.each((player: Player): string[] => {
            const base = player.position[1] + player.scale[1]

            let inAir = true

            // top, right, bottom, left
            let toSolve = [...Array(4)].fill(true)

            for (const i of tiles.snapshot()) {
                const tile = (i.components as unknown) as Tile

                const tileY = tile.row * tile.size
                const tileX = tile.column * tile.size

                // vertical collisions
                const collidedHorisontally = flatLineIntersection(
                    player.position[0],
                    player.scale[0],
                    tileX,
                    tile.size
                )

                const collidedVertically = flatLineIntersection(
                    player.position[1],
                    player.scale[1],
                    tileY,
                    tile.size
                )

                if (
                    toSolve[0] &&
                    player.speed[1] >= 0 &&
                    collidedHorisontally &&
                    pointOnFlatLine(base, tileY, tile.size)
                ) {
                    player.position[1] = tileY - player.scale[1]
                    player.speed[1] = 0
                    player.state = 'ground'

                    inAir = false
                    toSolve[0] = false
                }

                if (
                    toSolve[1] &&
                    collidedVertically &&
                    pointOnFlatLine(
                        player.position[0] + player.scale[0],
                        tileX,
                        tile.size / 2
                    )
                ) {
                    player.position[0] = tileX - player.scale[0]
                    player.speed[0] = 0

                    toSolve[1] = false
                }

                if (
                    toSolve[2] &&
                    player.speed[1] < 0 &&
                    collidedHorisontally &&
                    pointOnFlatLine(player.position[1], tileY, tile.size)
                ) {
                    player.position[1] = tileY + tile.size
                    player.speed[1] = 0
                    // player.state = 'ground'

                    // inAir = false
                    toSolve[2] = false
                }

                if (
                    toSolve[3] &&
                    collidedVertically &&
                    pointOnFlatLine(
                        player.position[0],
                        tileX + tile.size / 2,
                        tile.size / 2
                    )
                ) {
                    player.position[0] = tileX + tile.size
                    player.speed[0] = 0

                    toSolve[3] = false
                }

                if (toSolve.indexOf(true) === -1) break
            }

            if (inAir) {
                if (player.speed[1] < 0) {
                    player.state = 'jumping'
                } else if (player.speed[1] >= 0) {
                    player.state = 'falling'
                }
            }

            return ['position', 'state', 'speed']
        })
    }
}
