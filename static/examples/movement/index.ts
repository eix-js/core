import { Ecs, ComponentExposer } from '@eix/core'
import { KeyboardInput } from '@eix/input'
import loop from 'mainloop.js'

type playerState = 'up' | 'fall' | 'down' | 'none' | 'wall'
type sidewaysState = 'air' | 'ground'

interface Player extends Record<string, unknown> {
    readonly sideWaysForce: Record<sidewaysState, number>
    readonly gravityMultiplyer: Record<playerState, number>
    readonly size: [number, number]
    readonly rigidbody: true
    readonly jumpForce: number
    readonly jumpOffset: number

    renderable: boolean
    position: [number, number]
    color: string
    speed: [number, number]
    landed: number
    hitTheSide: number
    wallJumpOffest: number
    collided: [boolean, boolean]
    collisionDirections: [number, number]
    state: playerState
}

const directions = [
    new KeyboardInput('down', 's'),
    new KeyboardInput('right', 'd'),
    new KeyboardInput('up', 'w', 'space'),
    new KeyboardInput('left', 'a')
]

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

const screenSize = [window.innerWidth, window.innerHeight]

const physics = {
    gravity: [0, 0.005],
    timeSpeed: 0.85
}

const colors: Record<playerState, string> = {
    none: 'blue',
    fall: 'black',
    up: 'green',
    down: 'red',
    wall: 'yellow'
}

canvas.width = screenSize[0]
canvas.height = screenSize[1]

const ecs = new Ecs({
    groupEvents: false, // default
    changeDetection: 'manual' //default
})

const render = (): (() => void) => {
    const renderable = ecs.all
        .flag('renderable')
        .get<Player>() as ComponentExposer<Player>

    return (): void => {
        ctx.clearRect(0, 0, 10000, 10000)

        renderable.each((entity: Player): false => {
            ctx.fillStyle = entity.color
            ctx.fillRect(
                entity.position[0],
                entity.position[1],
                entity.size[0],
                entity.size[1]
            )

            return false
        })
    }
}

const update = (): ((delta: number) => void) => {
    const toUpdate = ecs.all.flag('rigidbody').get<Player>()

    let jumpCount = 0

    directions[2].valueChanges.subscribe((value: boolean): void => {
        if (value) {
            jumpCount++
        }
    })

    const exit = new KeyboardInput('q')
    exit.valueChanges.subscribe((value: boolean): void => {
        if (value) {
            toUpdate.each((entity: Player): string => {
                entity.renderable = false

                return 'renderable'
            })
        }
    })

    return (delta: number) => {
        const time = delta * physics.timeSpeed

        toUpdate.each((entity: Player): string[] => {
            entity.speed = entity.speed.map(
                (value: number, index: number): number => {
                    let state: playerState = 'none'

                    if (
                        (entity.position[0] < 10 ||
                            entity.position[0] + entity.size[0] >
                                screenSize[0] - 10) &&
                        entity.speed[1] > 0
                    ) {
                        state = 'wall'
                    } else if (directions[0].value && entity.speed[index] > 0) {
                        state = 'down'
                    } else if (directions[2].value && entity.speed[index] < 0) {
                        state = 'up'
                    } else if (entity.speed[index] > 0) {
                        state = 'fall'
                    }

                    entity.state = state
                    entity.color = colors[state]

                    const speed =
                        value +
                        physics.gravity[index] *
                            entity.gravityMultiplyer[state] *
                            time

                    return speed
                }
            ) as [number, number]

            entity.position = entity.position.map(
                (value: number, index: number): number => {
                    let position = value + time * entity.speed[index]
                    let collision = false
                    let collisionDirection = 0

                    if (position < 0) {
                        collision = true
                        collisionDirection = -1
                        position = 0
                    } else if (
                        position + entity.size[index] >
                        screenSize[index]
                    ) {
                        collision = true
                        collisionDirection = 1
                        position = screenSize[index] - entity.size[index]
                    }

                    entity.collisionDirections[index] = collisionDirection

                    if (collision !== entity.collided[index] || index === 0) {
                        entity.collided[index] = collision

                        if (collision && index === 1) {
                            entity.landed = performance.now()
                        }
                    }

                    if (collision) {
                        entity.speed[index] = 0

                        if (
                            index === 1 &&
                            directions[2].value &&
                            collision &&
                            collisionDirection === 1 &&
                            performance.now() - entity.landed >
                                entity.jumpOffset &&
                            jumpCount !== 0
                        ) {
                            entity.speed[index] = entity.jumpForce
                            jumpCount = 0
                        }
                    }

                    if (
                        index === 1 &&
                        directions[2].value &&
                        entity.state === 'wall' &&
                        jumpCount !== 0
                    ) {
                        let direction = -1

                        if (entity.position[0] > 10) direction = 1

                        entity.speed[1] = entity.jumpForce / 1.3
                        entity.speed[0] = (direction * entity.jumpForce) / 3
                        entity.hitTheSide = performance.now()
                        jumpCount = 0
                    }

                    if (
                        index === 0 &&
                        performance.now() - entity.hitTheSide >
                            entity.wallJumpOffest
                    ) {
                        let sidewaysMovement =
                            Number(directions[1].value) -
                            Number(directions[3].value)

                        let sideWaysSate: sidewaysState = 'ground'

                        if (!entity.collided[1]) {
                            sideWaysSate = 'air'
                        }

                        if (!(sidewaysMovement === collisionDirection)) {
                            entity.speed[index] =
                                entity.sideWaysForce[sideWaysSate] *
                                sidewaysMovement
                        }

                        if (
                            sidewaysMovement === 0 &&
                            sideWaysSate === 'ground'
                        ) {
                            entity.speed[index] = 0
                            // const { abs } = Math
                            // const x = entity.speed[index]
                            // entity.speed[index] =
                            // (x / abs(x)) * (abs(x) - entity.sideWaysForce[sideWaysSate])
                        }
                    }

                    return position
                }
            ) as [number, number]

            return ['position', 'speed', 'landed', 'collided', 'color']
        })
    }
}

loop.setDraw(render())
    .setUpdate(update())
    .start()

const initialData: Player = {
    position: [100, 100],
    size: [50, 50],
    color: 'blue',
    renderable: true,
    rigidbody: true,
    speed: [0, 0],
    jumpForce: -1.5,
    sideWaysForce: {
        ground: 0.75,
        air: 0.45
    },
    collided: [false, false],
    collisionDirections: [0, 0],
    landed: performance.now(),
    jumpOffset: 200,
    gravityMultiplyer: {
        up: 0.5,
        fall: 1.5,
        down: 3,
        none: 1,
        wall: 0.1
    },
    wallJumpOffest: 500,
    hitTheSide: performance.now(),
    state: 'none'
}

ecs.addEntity(initialData)
