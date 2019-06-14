import { Ecs } from '../../src/ecs'
import { writeFileSync } from 'fs'
import { log } from '../log'

const ecs = new Ecs({
	groupEvents: true
})

const componentNames = ['someComponent', 'someOtherComponent']

const entityId = ecs
	.addInputNodeToQueryGraph({
		name: 'randomFilter',
		test: (id: number): boolean => {
			return !!ecs.entities[id].components[componentNames[0]]
		},
		caresAbout: [componentNames[0]],
		lastValue: false
	})
	.addInputNodeToQueryGraph({
		name: 'randomFilter2',
		test: (id: number): boolean => {
			return !!ecs.entities[id].components[componentNames[1]]
		},
		caresAbout: [componentNames[1]],
		lastValue: false
	})
	.addEntity()

ecs.addComponentTo(entityId, {
	[componentNames[0]]: 'Do you see this?',
	[componentNames[1]]: "You don't see this!"
})

ecs.has(...componentNames)

ecs.resolve()

writeFileSync(`${__dirname}/ecs.json`, log(ecs))
