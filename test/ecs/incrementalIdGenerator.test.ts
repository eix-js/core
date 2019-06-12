import { incrementalIdGenerator } from '../../src/ecs/incrementalIdGenerator'
import { testIdGenerator } from '../utils/idGeneratorTester'
import { expect } from 'chai'
import { random } from '../utils/random'

const idCount = 10
const randomStartingValueTries = 10
const randomStartingPointRange = [-1000, 1000]

describe('Incremental id generator', (): void => {
	it('should generate unique ids', (): void => {
		testIdGenerator(idCount, incrementalIdGenerator)
	})

	it('shoud generate consecutive ids', (): void => {
		const idGenerator = incrementalIdGenerator()

		for (let i = 1; i <= idCount; i++) {
			const id = idGenerator()
			expect(id).to.equal(i)
		}
	})

	it('should allow arbitrary starting values', (): void => {
		for (let i = 0; i < randomStartingValueTries; i++) {
			const startingValue = random(
				randomStartingPointRange[0],
				randomStartingPointRange[1]
			)
			const idGenerator = incrementalIdGenerator(startingValue)

			for (let j = 1; j <= idCount; j++) {
				const id = idGenerator()

				expect(id).to.equal(j + startingValue)
			}
		}
	})
})
