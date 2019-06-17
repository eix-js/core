import { Ecs, ComponentExposer } from '@eix/core'
import loop from 'mainloop.js'

interface Player extends Record<string, unknown> {
  position: [number, number]
  size: [number, number]
  color: string
  renderable: true
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

const ecs = new Ecs({
  groupEvents: false
})

const render = (): (() => void) => {
  const renderable = ecs.all
    .flag('renderable')
    .get<Player>() as ComponentExposer<Player>

  return (): void => {
    ctx.clearRect(0, 0, 10000, 10000)

    renderable.snapshot().forEach((entity: Player): void => {
      ctx.fillStyle = entity.color
      ctx.fillRect(
        entity.position[0],
        entity.position[1],
        entity.size[0],
        entity.size[1]
      )
    })
  }
}

loop.setDraw(render()).start()

const initialData: Player = {
  position: [100, 100],
  size: [20, 20],
  color: 'blue',
  renderable: true
}

ecs.addEntity(initialData)
