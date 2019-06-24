import { Ecs } from '@eix/core'
import loop from 'mainloop.js'
import { Tile, Player, Camera } from './types'
import { Network, DataSet } from 'vis'

//@ts-ignore
import map from './maps/small'
import { applyGravity } from './jobs/gravity'
import { drawGameObjects } from './render/gameObjects'
import { drawTiles } from './render/tiles'
import { move } from './jobs/move'
import { collide } from './jobs/collide'
import { control } from './jobs/control'
import { camera } from './render/camera'
import { moveCamera } from './jobs/moveCamera'
import { KeyboardInput } from '@eix/input'

const tile = (row: number, column: number): Tile => ({
    row,
    column,
    size: 30,
    color: 'black',
    tile: true
})

function loadMap(ecs: Ecs) {
    const size = map.width
    const { floor } = Math

    for (const layer of map.layers) {
        for (let i = 0; i < layer.data.length; i++) {
            const value = layer.data[i]

            if (value === 0) continue

            ecs.addEntity(tile(floor(i / size), i % size))
        }
    }
}

export const main = (
    canvas: HTMLCanvasElement,
    container: HTMLDivElement
): void => {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    const key = new KeyboardInput('q')

    key.valueChanges.subscribe((value: boolean): void => {
        if (value) ctx.scale(0.1, 0.1)
        else ctx.scale(10, 10)
    })

    const ecs = new Ecs({
        changeDetection: 'manual', // default
        groupEvents: false,
        setComponentOnUpdate: false
    })

    loop.setDraw((): void => {
        ctx.clearRect(0, 0, 100000, 100000)
        ctx.save()

        for (const job of drawingJobs) {
            job()
        }

        ctx.restore()
    })
        .setUpdate((delta: number) => {
            for (const job of updateJobs) {
                job(delta)
            }
        })
        .start()
    // .setMaxAllowedFPS(30)

    loadMap(ecs)

    ecs.addEntity<Camera>({
        position: [0, 0],
        speed: 30,
        camera: true // this is a flag
    })

    ecs.addEntity<Player>({
        state: 'falling',
        gameobject: true,
        player: true,
        gravity: {
            ground: 1,
            sliding: 0.1,
            falling: 1.5,
            jumping: 0.75
        },
        speed: [0, 0],
        position: [100, 100],
        scale: [30, 30],
        color: 'green'
    })

    const updateJobs = [
        control(ecs),
        applyGravity(ecs),
        move(ecs),
        collide(ecs),
        moveCamera(ecs)
    ]
    const drawingJobs = [
        camera(ecs, ctx),
        drawTiles(ecs, ctx),
        drawGameObjects(ecs, ctx)
    ]

    if (true) {
        // do this for the query graph to look cooler
        if (false) {
            ecs.all.flag('player', 'tile', 'camera')
            ecs.all.flag('player', 'camera', 'gameobject')
            ecs.all.flag('player', 'gameobject')
        }

        ecs.ecsGraph.resolve()

        const ecsNodes = []
        const ecsEdges = []

        for (let i of Object.values(ecs.ecsGraph.QueryGraph)) {
            ecsNodes.push({
                id: i.id,
                label: i.filters[0] ? i.filters[0].name : i.id.toString()
            })

            for (let j of i.outputsTo) {
                ecsEdges.push({
                    from: i.id,
                    to: j
                })
            }
        }

        const nodes = new DataSet(ecsNodes)
        const edges = new DataSet(ecsEdges)

        const data = {
            nodes,
            edges
        }

        const options = {
            physics: {
                enabled: true
            },
            edges: {
                arrows: 'to'
            }
        }

        new Network(container, data, options)
    }
}
