import { Ecs } from '../../src/ecs/ecs'
import { expect } from 'chai'
import { random } from '../utils/random'
import { entityId } from '../../src/ecs/types'
import { wait } from '../utils/wait'

const customIdGeneratorConstantRange = [-1000, 1000]
const bulkEntityRange = [100, 300]

describe('Ecs', (): void => {
	it('should emit the newEntity event when adding a new entity.', async (): Promise<
		void
	> => {
		const ecs = new Ecs()
		let recivedEvent = false

		ecs.on('add', (): void => {
			recivedEvent = true
		})

		ecs.addEntity()

		await wait(0) // continue next tick

		expect(recivedEvent).to.equal(true)
	})

	it('should group events emitted on the same tick while in async mode.', async (): Promise<
		void
	> => {
		const entityCount = random(bulkEntityRange[0], bulkEntityRange[1])
		const ecs = new Ecs()

		let eventCount = 0
		let idCount = 0

		ecs.on('add', (ids: entityId[]): void => {
			eventCount++
			idCount += ids.length
		})

		for (let i = 0; i < entityCount; i++) ecs.addEntity()

		await wait(0) // continue next tick

		expect(eventCount).to.equal(1)
		expect(idCount).to.equal(ecs.tracked.length)
	})

	it('should split groups in chunks while in async mode and maxActiveStackCount is not Infinity.', async (): Promise<
		void
	> => {
		const entityCount = random(bulkEntityRange[0], bulkEntityRange[1])
		const maxActiveStackCount = random(20, 50)

		const ecs = new Ecs()

		ecs.maxActiveStackCount = maxActiveStackCount

		let eventCount = 0
		let idCount = 0

		ecs.on('add', (ids: entityId[]): void => {
			eventCount++
			idCount += ids.length
		})

		for (let i = 0; i < entityCount; i++) ecs.addEntity()

		await wait(0)

		expect(eventCount).to.equal(
			Math.floor(entityCount / ecs.maxActiveStackCount)
		)
		expect(idCount).to.equal(ecs.tracked.length)
	})

	it("shouldn't group events emitted on the same tick while in sync mode.", (): void => {
		const entityCount = random(bulkEntityRange[0], bulkEntityRange[1])
		const ecs = new Ecs(false)

		let eventCount = 0
		let idCount = 0

		ecs.on('add', (ids: entityId[]): void => {
			eventCount++
			idCount += ids.length
		})

		for (let i = 0; i < entityCount; i++) ecs.addEntity()

		expect(eventCount).to.equal(entityCount)
		expect(idCount).to.equal(ecs.tracked.length)
	})

	it('should allow for a custom id generator', (): void => {
		const customConstant = random(
			customIdGeneratorConstantRange[0],
			customIdGeneratorConstantRange[1]
		)

		const generator = (): (() => number) => (): number => customConstant

		const ecs = new Ecs(true, generator())

		// add an entity to recive its id
		const id = ecs.addEntity()

		expect(id).to.equal(customConstant)
	})
})
