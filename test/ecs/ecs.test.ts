import { Ecs } from '../../src/ecs/ecs';
import { random } from '../utils/random';
import { expect } from 'chai';
import { compareArrays } from '../../src/utils';

const getMode = (value: boolean): string => (value ? 'async' : 'sync');

describe('Ecs', (): void => {
    for (let i of [true, false]) {
        const mode = getMode(i);

        it(`should allow adding entities in ${mode} mdoe`, (): void => {
            const randomValue = random(0, 100);

            const ecs = new Ecs({
                groupEvents: i
            });

            const id = ecs.addEntity({
                param: randomValue
            });

            if (i) ecs.ecsGraph.resolve();

            expect(ecs.ecsGraph.entities[id].components.param).to.equal(randomValue);
        });

        it(`should allow querying with a flag in ${mode} mode`, (): void => {
            const ecs = new Ecs({
                groupEvents: i
            });

            const ids: number[] = [];

            const nodes = [ecs.all.flag('i'), ecs.all.flag('j'), ecs.all.flag('i', 'j')];

            for (let i of [false, true]) {
                for (let j of [false, true]) {
                    ids.push(
                        ecs.addEntity({
                            i,
                            j
                        })
                    );
                }
            }

            ecs.ecsGraph.resolve();

            expect(compareArrays(Array.from(nodes[0].snapshot.values()), [ids[2], ids[3]], true)).to.equal(true);

            expect(compareArrays(Array.from(nodes[1].snapshot.values()), [ids[1], ids[3]], true)).to.equal(true);

            expect(compareArrays(Array.from(nodes[2].snapshot.values()), [ids[3]])).to.equal(true);
        });
    }
});
