import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day15 {
    export function calculateHash(line: string): number {
        let currentValue = 0;
        for (let i = 0; i < line.length; i++) {
            currentValue = (currentValue + line.charCodeAt(i)) * 17;
            currentValue = currentValue % 256;
        }
        return currentValue;
    }
    export function part1(lines: string[]): number {
        return lines.reduce((t, line) => {
            return t + line.split(',').reduce((t1, v) => t1 + calculateHash(v), 0);
        }, 0);
    }

    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    const main = async () => {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day15.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day15.input'),
            false,
        );

        assert.equal(Y2023_Day15.calculateHash('HASH'), 52);
        assert.equal(Y2023_Day15.calculateHash('rn=1'), 30);

        console.log('part 1 example start');
        assert.equal(Y2023_Day15.part1(exampleLines), 1320, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day15.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 0);
        // part 2
        assert.equal(Y2023_Day15.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day15.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    };

    main().catch((err) => console.error(err));
}
