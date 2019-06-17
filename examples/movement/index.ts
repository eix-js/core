import { Ecs, ComponentExposer } from '@eix/core'
import { KeyboardInput } from '@eix/input'
import loop from 'mainloop.js'

type playerState = 'up' | 'fall' | 'down' | 'none'
type sidewaysState = 'air' | 'ground'

interface Player extends Record<string, unknown> {
    readonly sideWaysForce: Record<sidewaysState, number>
    readonly gravityMultiplyer: Record<playerState, number>
    readonly size: [number, number]
    readonly renderable: true
    readonly rigidbody: true
    readonly jumpForce: number
    readonly jumpOffset: number

    position: [number, number]
    color: string
    speed: [number, number]
    landed: number
    collided: [boolean, boolean]
}

const directions = [
    new KeyboardInput('down', 's'),
    new KeyboardInput('right', 'd'),
    new KeyboardInput('up', 'w'),
    new KeyboardInput('left', 'a')
]

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

const screenSize = [window.innerWidth, window.innerHeight]

const physics = {
    gravity: [0, 0.005],
    timeSpeed: 0.75
}

const colors: Record<playerState, string> = {
    none: 'blue',
    fall: 'black',
    up: 'green',
    down: 'red'
}

canvas.width = screenSize[0]
canvas.height = screenSize[1]

const ecs = new Ecs({
    groupEvents: false, // default
    changeDetection: 'manual' //default
})

const render = (): (() => void) => {
    const renderable = ecs.all.flag('renderable').get<Player>() as ComponentExposer<Player>

    return (): void => {
        ctx.clearRect(0, 0, 10000, 10000)

        renderable.each((entity: Player): false => {
            ctx.fillStyle = entity.color
            ctx.fillRect(entity.position[0], entity.position[1], entity.size[0], entity.size[1])

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

    return (delta: number) => {
        const time = delta * physics.timeSpeed

        toUpdate.each((entity: Player): string[] => {
            entity.speed = entity.speed.map((value: number, index: number): number => {
                let state: playerState = 'none'

                if (directions[0].value && entity.speed[index] > 0) {
                    state = 'down'
                } else if (directions[2].value && entity.speed[index] < 0) {
                    state = 'up'
                } else if (entity.speed[index] > 0) {
                    state = 'fall'
                }

                entity.color = colors[state]

                const speed =
                    value + physics.gravity[index] * entity.gravityMultiplyer[state] * time

                return speed
            }) as [number, number]

            entity.position = entity.position.map((value: number, index: number): number => {
                let position = value + time * entity.speed[index]
                let collision = false
                let collisionDirection = 0

                if (position < 0) {
                    collision = true
                    collisionDirection = -1
                    position = 0
                } else if (position + entity.size[index] > screenSize[index]) {
                    collision = true
                    collisionDirection = 1
                    position = screenSize[index] - entity.size[index]
                }

                if (collision !== entity.collided[index]) {
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
                        performance.now() - entity.landed > entity.jumpOffset &&
                        jumpCount !== 0
                    ) {
                        entity.speed[index] = entity.jumpForce
                        jumpCount = 0
                    }
                }

                if (index === 0) {
                    let sidewaysMovement = Number(directions[1].value) - Number(directions[3].value)

                    let sideWaysSate: sidewaysState = 'ground'

                    if (!entity.collided[1]) {
                        sideWaysSate = 'air'
                    }

                    if (!(sidewaysMovement === collisionDirection)) {
                        entity.speed[index] = entity.sideWaysForce[sideWaysSate] * sidewaysMovement
                    }
                    if (sidewaysMovement === 0) {
                        entity.speed[index] = 0
                    }
                }

                return position
            }) as [number, number]

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
    landed: performance.now(),
    jumpOffset: 200,
    gravityMultiplyer: {
        up: 0.5,
        fall: 1.5,
        down: 3,
        none: 1
    }
}

ecs.addEntity(initialData)
