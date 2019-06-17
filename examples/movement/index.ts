import { Ecs, ComponentExposer } from '@eix/core'
import { KeyboardInput } from '@eix/input'
import loop from 'mainloop.js'

interface Player extends Record<string, unknown> {
    position: [number, number]
    size: [number, number]
    color: string
    renderable: true
    rigidbody: true
    speed: [number, number]
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

    return (time: number) => {
        toUpdate.each((entity: Player): string => {
            let moveTo = [0, 0]

            for (let direction = 0; direction < directions.length; direction++) {
                if (directions[direction].value) {
                    const index = (direction % 2) * -1 + 1

                    if (direction < 2) moveTo[index] += 1
                    else moveTo[index] -= 1
                }
            }

            entity.position = entity.position.map(
                (value: number, index: number, arr: number[]): number => {
                    let position = (arr[index] = value + moveTo[index] * time * entity.speed[index])

                    if (position < 0) position = 0
                    else if (position + entity.size[index] > screenSize[index])
                        position = screenSize[index] - entity.size[index]

                    return position
                }
            ) as [number, number]

            return 'position'
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
    speed: [0.5, 0.5]
}

ecs.addEntity(initialData)
