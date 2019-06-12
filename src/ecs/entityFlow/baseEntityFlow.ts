import {
	EntitySource,
	EntityFilter,
	EntityFlowOutput
} from '../entitySource/types'
import { entityId } from '../types'
import { BehaviorSubject } from 'rxjs'
import { basicPipe } from './basePipe'
import { EventEmitter } from 'ee-ts'
import { entityFlowEvents } from '../entityCache'

export class BaseEntityFlow extends EventEmitter<entityFlowEvents>
	implements EntitySource {
	public output = new BehaviorSubject<entityId[]>([])
	public tracked: entityId[] = []

	private filter: EntityFilter

	/**
	 * @description - The basic Entity flow group extended by everything else.
	 *
	 * @param input - Source for eneity ids.
	 * @param filter - The filter to apply to the ids.
	 */
	public constructor (input: EntityFlowOutput, filter: EntityFilter) {
		super()
		this.filter = filter

		input.on('add', (ids: entityId[]): void => {
			this.tracked.push(
				...ids.filter((id: entityId): boolean => this.filter.solve(id))
			)
		})
	}

	/**
	 * @description Applies a filter to all entities.
	 *
	 * @param filter - The filter to apply to the entities.
	 * @returns An entitySource - like filtering suff.
	 */
	public pipe (filter: EntityFilter): EntitySource {
		return basicPipe(this, filter)
	}
}
