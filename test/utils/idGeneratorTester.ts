import { entityId } from '../../src/ecs/types'
import { expect } from 'chai'

/**
 * @description Tests a given id generator
 *
 * @param times - Specifies how many ids to generate.
 * @param testIdGenerator - The actual generator to test.
 * @param args - The arguments passed to the generator function.
 */
function testIdGenerator<T extends unknown[]> (
    times = 100,
    testIdGenerator: (...args: T) => () => entityId,
    ...args: T
): void {
    const idGenerator = testIdGenerator(...args)
    const ids = [...Array(times)].map((): entityId => idGenerator())
    const uniqueIds = Array.from(new Set(ids))

    expect(uniqueIds.length).to.equal(ids.length)
}

export { testIdGenerator }
