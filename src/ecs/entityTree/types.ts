import { EntityFilter, entityId, entityActions } from '../types'
import { EntityTree } from './entityTree'

export interface Node {
	children: Node[];
	parent: Node | undefined;

	tree: EntityTree;
	ownFilters: EntityFilter[];

	pushData(key: entityActions, ids: entityId[]): Node;
	filtersToHead(): EntityFilter[];
	dispose(): Node;
}
