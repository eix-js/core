import { Ecs } from '../../src/ecs/ecs'
import { expect } from 'chai'

describe('The ecs instance', (): void => {
    let ecs: Ecs

    beforeEach((): void => {
        ecs = new Ecs({
            groupEvents: false
        })
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

    describe('the removeEntity method', (): void => {
        let id: number

        beforeEach(() => {
            id = ecs.addEntity({
                test: true
            })
        })

        it('should remove the entity from the ecs graph', () => {
            ecs.removeEntity(id)

            expect(ecs.ecsGraph[id]).to.be.undefined
        })
    })
})
