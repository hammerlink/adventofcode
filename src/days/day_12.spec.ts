import {Day12} from "./day_12";
import {expect} from "chai";

describe('day 12', function () {
    describe('part 1', function () {
        it('should execute steps correctly', function () {
            const moons: Day12.Moon[] = [
                {id: 0, velocity: {x: 0, y: 0, z: 0}, position: {x: -1, y: 0, z: 2}},
                {id: 1, velocity: {x: 0, y: 0, z: 0}, position: {x: 2, y: -10, z: -7}},
                {id: 2, velocity: {x: 0, y: 0, z: 0}, position: {x: 4, y: -8, z: 8}},
                {id: 2, velocity: {x: 0, y: 0, z: 0}, position: {x: 3, y: 5, z: -1}},
            ];

            const moonsStep1 = Day12.simulateMoonMotions(moons, 1);
            expect(JSON.stringify(moonsStep1[0].position)).equal(JSON.stringify({x: 2, y: -1, z: 1}));
            expect(JSON.stringify(moonsStep1[0].velocity)).equal(JSON.stringify({x: 3, y: -1, z: -1}));
            expect(JSON.stringify(moonsStep1[1].position)).equal(JSON.stringify({x: 3, y: -7, z: -4}));
            expect(JSON.stringify(moonsStep1[1].velocity)).equal(JSON.stringify({x: 1, y: 3, z: 3}));
            expect(JSON.stringify(moonsStep1[2].position)).equal(JSON.stringify({x: 1, y: -7, z: 5}));
            expect(JSON.stringify(moonsStep1[2].velocity)).equal(JSON.stringify({x: -3, y: 1, z: -3}));
            expect(JSON.stringify(moonsStep1[3].position)).equal(JSON.stringify({x: 2, y: 2, z: 0}));
            expect(JSON.stringify(moonsStep1[3].velocity)).equal(JSON.stringify({x: -1, y: -3, z: 1}));


            const moonsStep2 = Day12.simulateMoonMotions(moons, 2);
            expect(JSON.stringify(moonsStep2[0].velocity)).equal(JSON.stringify({x: 3, y: -2, z: -2}));
            expect(JSON.stringify(moonsStep2[0].position)).equal(JSON.stringify({x: 5, y: -3, z: -1}));
        });
    })
});
