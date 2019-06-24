import { Ecs } from '../../src/ecs/ecs'
import { expect } from 'chai'
import { random } from '../utils/random'
import { Entity } from '../../src/types'

describe('The ecs instance', (): void => {
    let ecs: Ecs

    beforeEach((): void => {
        ecs = new Ecs()
    })

    describe('The count property', (): void => {
        it('should be 0 at the start', (): void => {
            expect(ecs.count).to.equal(0)
        })

        it('should be 1 after adding 1 entity', (): void => {
            ecs.addEntity({})
            expect(ecs.count).to.equal(1)
        })

        it('should be 1 after adding then removing an entity', (): void => {
            const id = ecs.addEntity({})
            ecs.removeEntity(id)

            expect(ecs.count).to.equal(0)
        })
    })

    describe('The addEntity method', (): void => {
        let id: number

        beforeEach(() => {
            id = ecs.addEntity({
                test: true
            })
        })

        it('should return an id', (): void => {
            expect(id).to.be.a('number')
        })

        it('should add entities to the ecs graph', (): void => {
            expect(ecs.ecsGraph.entities[id].id).to.equal(id)
        })

        it('should add the id of the entity to snapshots', (): void => {
            ecs.all.flag('test')

            expect(
                Object.values(ecs.ecsGraph.QueryGraph)[0].snapshot
            ).to.include(id)
        })
    })

    describe('The removeEntity method', (): void => {
        let id: number

        beforeEach(() => {
            id = ecs.addEntity({
                test: true
            })
        })

        it('should remove the entity from the ecs graph', () => {
            ecs.removeEntity(id)

            expect(ecs.ecsGraph.entities[id]).to.be.undefined
        })
    })

    describe('The setComponentOnUpdate option', (): void => {
        let id: number
        let value: number

        beforeEach(() => {
            value = random(10, 100)

            id = ecs.addEntity({
                prop: value
            })
        })

        it('should set the components when reciving the events', () => {
            const newValue = random(10, 100)

            ecs.ecsGraph.pushEventToQueue('updateComponents', {
                id,
                components: {
                    prop: newValue
                }
            })

            expect(ecs.ecsGraph.entities[id].components.prop).to.equal(newValue)
        })

        it('should emit events when returning something in .each', async () => {
            const entities = ecs.all
                .where('prop', '==', value)
                .get<{ prop: number }>()

            const promise = new Promise<Entity[]>(res => {
                ecs.ecsGraph.emitter.one('updateComponents', res)
            })

            entities.each(entity => {
                entity.prop = 7

                return 'prop'
            })

            const eventData = await promise

            expect(eventData[0].components.prop).to.equal(7)
        })
    })
})
