import { Node } from './types'
import { EntityFilter, entityId, entityActions } from '../types'
import { removeItem } from '../removeItemFromArray'
import { EntityTree } from './entityTree'

/**
 * @module EntityNode
 */

export class EntityNode implements Node {
	public children: EntityNode[] = []
	public parent: EntityNode | undefined
	public tree: EntityTree
	public ownFilters: EntityFilter[] = []

	public snapshot: entityId[] = []

	private onlyAliveForChildren = false

	public constructor (
		tree: EntityTree,
		filters: EntityFilter[] = [],
		parent?: EntityNode
	) {
		this.tree = tree
		this.parent = parent
		this.ownFilters.push(...filters)
	}

	public pushData (key: entityActions, ids: entityId[]): EntityNode {
		const evaluationResult = ids.filter((id: entityId): boolean =>
			this.evalFilters(id)
		)

		if (evaluationResult.length) {
			this.children.forEach((child: EntityNode): void => {
				child.pushData(key, evaluationResult)
			})

			this.updateSnapshot(key, evaluationResult)
		}

		return this
	}

	private updateSnapshot (key: entityActions, ids: entityId[]): EntityNode {
		if (key === 'add') {
			this.snapshot.push(...ids)
		} else if (key === 'remove') {
			ids.forEach((id: entityId): void => removeItem(this.snapshot, id))
		}

		return this
	}

	public dispose (): EntityNode {
		if (this.children.length) this.onlyAliveForChildren = true
		else {
			this.parent = undefined

			if (this === this.tree.head) this.tree.head = undefined
		}
		return this
	}

	public removeNode (node: EntityNode): this {
		removeItem(this.children, node)

		if (this.onlyAliveForChildren) this.dispose()

		return this
	}

	public filtersToHead (): EntityFilter[] {
		if (this.tree.head === this) return []
		else {
			const filtersOnTop = this.parent ? this.parent.filtersToHead() : []
			return [...this.ownFilters, ...filtersOnTop]
		}
	}

	private evalFilters (id: entityId): boolean {
		for (let filter of this.ownFilters) {
			if (!filter.solve(id)) {
				return false
			}
		}
		return true
	}
}
