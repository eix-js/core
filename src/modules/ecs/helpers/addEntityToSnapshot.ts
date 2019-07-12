import { Node } from '../types/NodeData'
import { eventCodes } from '../constants'

export function addEntityToSnapshot(entityId: number, node: Node) {
    node.data.snapshot.add(entityId)
    node.data.emitter.emit(eventCodes.addEntity, [
        {
            id: entityId,
            components: {}
        }
    ])
}
