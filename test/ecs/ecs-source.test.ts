import { expect } from 'chai'
import { Ecs } from '../../src/ecs/ecs'
import { wait } from '../utils/wait'

describe('The ecs entitySource implementation', (): void => {
	it('should update .tracked on change', async (): Promise<void> => {
		const ecs = new Ecs()
		expect(ecs.tracked.length).to.equal(0)

		// add an entity and try again
		ecs.addEntity()

		await wait(0) // continue next tick

		expect(ecs.tracked.length).to.equal(1)
	})
})
