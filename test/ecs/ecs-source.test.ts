import { expect } from 'chai'
import { Ecs } from '../../src/ecs/ecs'
import { wait } from '../utils/wait'

describe('The ecs entitySource implementation', (): void => {
	it('should update .tracked on change', async (): Promise<void> => {
		console.log(1)
		const ecs = new Ecs()
		console.log(2)
		expect(ecs.tracked.length).to.equal(0)

		// add an entity and try again
		ecs.addEntity()

		console.log(3)

		await wait(0) // continue next tick

		expect(ecs.tracked.length).to.equal(1)

		console.log(4)
	})
})
