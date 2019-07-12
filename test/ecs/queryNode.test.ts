import { QueryNode, Ecs, ComponentExposer } from '../../src'
import { expect } from 'chai'
import { random } from '../utils/random'

describe('The queryNode instance', () => {
    let node: QueryNode
    let ecs: Ecs

    beforeEach(() => {
        ecs = new Ecs()
        node = ecs.all
    })

    describe('The flag filter', () => {
        let entities: ComponentExposer<{ flag: boolean }>

        beforeEach(() => {
            entities = node.flag('flag').get()
        })

        it("shouldn't query components wich don't have the flag", () => {
            const id = ecs.addEntity({
                flag: false
            })

            expect(entities.ids()).to.not.include(id)
        })

        it('should query components wich have the flag', () => {
            const id = ecs.addEntity({
                flag: true
            })

            expect(entities.ids()).to.include(id)
        })

        it('should not epxpose an entity after it is deleted', () => {
            const id = ecs.addEntity({
                flag: true
            })

            ecs.removeEntity(id)

            expect(entities.ids()).to.have.length(0)
        })

        describe('Updating a component', () => {
            let id: number

            beforeEach(() => {
                id = ecs.addEntity({
                    flag: true,
                    prop: 7
                })
            })

            it('shoudnt change anything when updating a component wich isnt flagged', () => {
                ecs.ecsGraph.handleEvent('updateComponents', {
                    id,
                    components: {
                        prop: 8
                    }
                })

                expect(entities.ids()).to.include(id)
            })

            it('should change when updating a flagged component', () => {
                ecs.ecsGraph.handleEvent('updateComponents', {
                    id,
                    components: {
                        flag: false
                    }
                })
            })

            it('should add an entity if its component changes to fit the flag', () => {
                const id = ecs.addEntity({
                    flag: false
                })

                ecs.ecsGraph.handleEvent('updateComponents', {
                    id,
                    components: {
                        flag: true
                    }
                })

                expect(entities.ids()).to.include(id)
            })
        })

        it('should allow chaining', () => {
            const chained = node
                .flag('flag')
                .flag('flag2')
                .get()

            const id = ecs.addEntity({
                flag: true,
                flag2: true
            })

            expect(chained.ids()).to.include(id)
        })

        describe('Passing multiple component names', () => {
            let multple: ComponentExposer<{ flag: boolean; flag2: boolean }>

            beforeEach(() => {
                multple = node.flag('flag', 'flag2').get()
            })

            it('should query entities wich have all the flags', () => {
                const id = ecs.addEntity({
                    flag: true,
                    flag2: true
                })

                expect(multple.ids()).to.include(id)
            })

            it("should not query component wich don't have a flag", () => {
                ecs.addEntity({
                    flag: true,
                    flags: false
                })

                expect(multple.ids()).to.have.length(0)
            })

            it('same but in reverse', () => {
                ecs.addEntity({
                    flag: false,
                    flag2: true
                })

                expect(multple.ids()).to.have.length(0)
            })

            it('should add an entity if flags are updated', () => {
                const id = ecs.addEntity({
                    flag: false
                    // flag2: false
                })

                ecs.ecsGraph.handleEvent('updateComponents', {
                    id,
                    components: {
                        flag: true,
                        flag2: true
                    }
                })

                expect(multple.ids()).to.include(id)
            })

            it('shouldnt add an entity if by updating flags are removed', () => {
                const id = ecs.addEntity({
                    flag: true
                })

                ecs.ecsGraph.handleEvent('updateComponents', {
                    id,
                    components: {
                        flag: false,
                        flag2: true
                    }
                })

                expect(multple.ids()).to.not.include(id)
            })
        })
    })

    describe('The .where filter', () => {
        let value: number
        let entities: ComponentExposer<{ prop: number }>

        beforeEach(() => {
            value = random(10, 100)
        })

        describe('The == operator', () => {
            beforeEach(() => {
                entities = node.where('prop', '==', value).get()
            })

            it("shouldn't query components wich don't meet the quality", () => {
                const id = ecs.addEntity({
                    prop: value + 1
                })

                expect(entities.ids()).to.not.include(id)
            })

            it('should query components wich meet the equality', () => {
                const id = ecs.addEntity({
                    prop: value
                })

                expect(entities.ids()).to.include(id)
            })
        })

        describe('The != operator', () => {
            beforeEach(() => {
                entities = node.where('prop', '!=', value).get()
            })

            it("should query components wich don't meet the quality", () => {
                const id = ecs.addEntity({
                    prop: value
                })

                expect(entities.ids()).to.not.include(id)
            })

            it("shouldn't query components wich meet the equality", () => {
                const id = ecs.addEntity({
                    prop: value + 1
                })

                expect(entities.ids()).to.include(id)
            })
        })

        describe('The < operator', () => {
            let ecs: Ecs
            let entities: ComponentExposer<{ foo: number }>

            beforeEach(() => {
                ecs = new Ecs()
                entities = ecs.all.where('foo', '<', 7).get()
            })

            it('should query entities where the expression is true', () => {
                ecs.addEntity({
                    foo: 6
                })

                expect(entities.ids().length).to.equal(1)
            })

            it("should't query entities where the expression isn't true", () => {
                ecs.addEntity({
                    foo: 7
                })
                ecs.addEntity({
                    foo: 8
                })

                expect(entities.ids()).to.have.length(0)
            })
        })

        describe('The > operator', () => {
            let ecs: Ecs
            let entities: ComponentExposer<{ foo: number }>

            beforeEach(() => {
                ecs = new Ecs()
                entities = ecs.all.where('foo', '>', 7).get()
            })

            it('should query entities where the expression is true', () => {
                ecs.addEntity({
                    foo: 8
                })

                expect(entities.ids()).to.have.length(1)
            })

            it("should't query entities where the expression isn't true", () => {
                ecs.addEntity({
                    foo: 7
                })
                ecs.addEntity({
                    foo: 6
                })

                expect(entities.ids()).to.have.length(0)
            })
        })

        describe('The <= operator', () => {
            let ecs: Ecs
            let entities: ComponentExposer<{ foo: number }>

            beforeEach(() => {
                ecs = new Ecs()
                entities = ecs.all.where('foo', '<=', 7).get()
            })

            it('should query entities where the expression is true', () => {
                ecs.addEntity({
                    foo: 6
                })
                ecs.addEntity({
                    foo: 7
                })

                expect(entities.ids()).to.have.length(2)
            })

            it("should't query entities where the expression isn't true", () => {
                ecs.addEntity({
                    foo: 8
                })

                expect(entities.ids()).to.have.length(0)
            })
        })

        describe('The >= operator', () => {
            let ecs: Ecs
            let entities: ComponentExposer<{ foo: number }>

            beforeEach(() => {
                ecs = new Ecs()
                entities = ecs.all.where('foo', '>=', 7).get()
            })

            it('should query entities where the expression is true', () => {
                ecs.addEntity({
                    foo: 8
                })
                ecs.addEntity({
                    foo: 7
                })

                expect(entities.ids()).to.have.length(2)
            })

            it("should't query entities where the expression isn't true", () => {
                ecs.addEntity({
                    foo: 6
                })

                expect(entities.ids()).to.have.length(0)
            })
        })
    })
})
