import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day04 {
    export function part1(lines: string[]): number {
        return 0;
    }
    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day04.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day04.input'),
            false,
        );

        // assert.equal(Y2023_Day04.part1(exampleLines), 4361, 'example 1 part 1');

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day04.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        // assert.equal(part1Result, 553825);

        // part 2
        // assert.equal(Y2023_Day04.part2(exampleLines), 467835, 'example 1 part 2');
        //
        // startMs = Date.now();
        // const part2Result = Y2023_Day04.part2(lines);
        // console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 66681);
    }

    main().catch((err) => console.error(err));
}
