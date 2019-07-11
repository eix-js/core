import { setToArray, removeDuplicates } from '../../../ecs/utils'

// Graph with inputs

export type INodeId = number

export class IGraphNode<T> {
    public next = new Set<IGraphNode<T>>()
    public previous = new Set<IGraphNode<T>>()

    constructor(public id: INodeId, public data: T, public input = true) {}
}

export class IGraph<T> {
    public nodes = new Map<INodeId, IGraphNode<T>>()
    public inputs = new Set<INodeId>()

    public addNode(hash: number, inputIds: INodeId[], data: T, isInput = true) {
        const node = new IGraphNode<T>(hash, data, isInput)
        this.nodes.set(hash, node)

        const inputNodes = this.getBulk(...inputIds)

        for (const inputNode of inputNodes) {
            node.previous.add(inputNode)
            inputNode.next.add(node)
        }

        if (isInput) {
            this.inputs.add(hash)
        }

        return node
    }

    public getBulk(...nodeIds: INodeId[]) {
        return nodeIds.map(nodeId => this.nodes.get(nodeId))
    }

    public get(id: INodeId) {
        return this.nodes.get(id)
    }

    public getInputs(node: { previous: Set<IGraphNode<T>> }, root = true) {
        const inputs: IGraphNode<T>[] = []

        for (let input of setToArray(node.previous)) {
            if (!input.input) {
                inputs.push(input)
            } else {
                inputs.push(...this.getInputs(input, false))
            }
        }

        if (root) return removeDuplicates(inputs)
        else return inputs
    }

    public getNodesChildren(nodes: IGraphNode<T>[], root = true) {
        if (!nodes.length) return []

        const result = nodes

        for (const node of nodes) {
            result.push(...this.getNodesChildren(setToArray(node.next), false))
        }

        if (root) return removeDuplicates(result)
        else return result
    }
}
