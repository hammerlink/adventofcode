import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day15 {


    export function part1(line: string, max = 2020): number {
        const startNumbers = line.split(',').map(v => parseInt(v, 10));
        let lastNumber = startNumbers[startNumbers.length - 1];
        const positions = {};
        for (let i = 0; i < startNumbers.length - 1; i++) positions[startNumbers[i]] = i;
        for (let i = startNumbers.length; i < max; i++) {
            const newItem = positions[lastNumber] === undefined ? 0 : i - 1 - positions[lastNumber];
            positions[lastNumber] = i - 1;
            lastNumber = newItem;
        }
        return lastNumber; // not working
    }

    export function part2(line: string,): number {
        return part1(line, 30000000);
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {

        const exampleLine = '0,3,6';

        assert.equal(Y2020_Day15.part1(exampleLine), 436, 'example 1 part 1');
        // assert.equal(Y2020_Day15.part2('0,3,6'), 175594, 'example 1 part 2')
        // assert.equal(Y2020_Day15.part1('1,3,2', 30000000), 2578, 'example 1 part 2')
        // assert.equal(Y2020_Day15.part1('2,1,3', 30000000), 3544142, 'example 1 part 2')
        // assert.equal(Y2020_Day15.part1('1,2,3', 30000000), 261214, 'example 1 part 2')
        // assert.equal(Y2020_Day15.part1('2,3,1', 30000000), 6895259, 'example 1 part 2')
        // assert.equal(Y2020_Day15.part1('3,2,1', 30000000), 18, 'example 1 part 2')
        // assert.equal(Y2020_Day15.part1('3,1,2', 30000000), 362, 'example 1 part 2')

        const line = '6,3,15,13,1,0';
        // part 1
        const part1Result = Y2020_Day15.part1(line);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day15.part2(line);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
