import { entityId } from '../../ecs/types/entityId'
import { INodeId } from './IGraph'
import { setToArray } from '../../../ecs/utils'

export class InfluenceTable {
    private map = new Map<entityId, Set<INodeId>>()

    public addInput(id: entityId) {
        this.map.set(id, new Set())
    }

    public removeInput(id: entityId) {
        this.map.delete(id)
    }

    public connect(from: entityId, to: INodeId) {
        this.map.get(from).add(to)
    }

    public get(id: entityId) {
        return this.map.get(id)
    }

    public getArray(id: entityId) {
        return setToArray(this.get(id))
    }
}
