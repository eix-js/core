import { entityId } from './types'

/**
 * @description The default id generator for the ecs class
 *
 * @param startingId - The id to start counting from.
 * @returns A function generating ids.
 */
function incrementalIdGenerator (startingId = 0): () => entityId {
    // private variable holding the last id
    let lastId = startingId

    return (): entityId => lastId++ + 1
}
export { incrementalIdGenerator }
