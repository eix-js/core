import { Ecs } from '../../src'
import { performance } from 'perf_hooks'
import { wait } from '../../test/utils/wait'

const entityCount = 100_000
const maxActiveStackCount = 30_000
const deltas = [] // sync, async, async-chunks

let start: number, end: number
;(async (): Promise<void> => {
	// sync mode
	const ecs1 = new Ecs(false)

	start = performance.now()

	for (let i = 0; i < entityCount; i++) ecs1.addEntity()

	end = performance.now()

	deltas.push(end - start)

	try {
		// async mode
		const ecs2 = new Ecs(true) // true by drfault

		start = performance.now()

		for (let i = 0; i < entityCount; i++) ecs2.addEntity()

		await wait(0) // continue next tick

		end = performance.now()

		deltas.push(end - start)
	} catch (err) {
		deltas[1] = -1
	}

	// async-chunk mode
	const ecs3 = new Ecs(true) // true by drfault
	ecs3.maxActiveStackCount = maxActiveStackCount

	start = performance.now()

	for (let i = 0; i < entityCount; i++) ecs3.addEntity()

	await wait(0) // continue next tick

	end = performance.now()

	deltas.push(end - start)

	const winner = deltas.indexOf(Math.min(...deltas))
	const emojis = deltas.map((): string => '👎')
	const names = ['sync', 'async', 'async-chunks']

	emojis[winner] = '👍'

	console.log(`Perf test on adding ${entityCount} entities in all ${deltas.length} modes 🔥 :
	
	- Sync mode took ${deltas[0]}ms ${emojis[0]}
	- Async mode took ${deltas[1]}ms ${emojis[1]}
	- Async-chunks mode took ${deltas[2]}ms ${emojis[2]}
    `)

	console.log(`The winner is: ${names[winner]} mode! 👏`)
})()
