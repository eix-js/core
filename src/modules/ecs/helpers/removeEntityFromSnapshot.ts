import { Node } from '../types/NodeData'
import { eventCodes } from '../constants'

export function removeEntityFromSnapshot(entityId: number, node: Node) {
    node.data.snapshot.delete(entityId)
    node.data.emitter.emit(eventCodes.removeEntity, [
        {
            id: entityId,
            components: {}
        }
    ])
}
