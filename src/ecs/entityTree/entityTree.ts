import { Node } from './types'
import { entityActions, entityId } from '../types'
import { EntityNode } from './EntityNode'
import { EventGrouper } from '../entityCache'

/**
 * @module EntityTree
 */

export class EntityTree {
	/**
	 * @description The primary source where data comes from
	 */
	public head: Node | undefined = new EntityNode(this)

	private eventGrouper = new EventGrouper(this)

	private _asyncMode: boolean

	public constructor (asyncMode = true) {
		this._asyncMode = asyncMode
	}

	public dispose (): EntityTree {
		if (this.head) this.head.dispose()
		return this
	}

	public pushData (key: entityActions, ids: entityId[]): this {
		if (this.head) this.head.pushData(key, ids)
		return this
	}

	public tryPushingData (key: entityActions, ids: entityId[]): this {
		if (this._asyncMode) this.eventGrouper.emit(key, ids)
		else this.pushData(key, ids)
		return this
	}
}
