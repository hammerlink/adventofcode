import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day02 {
    function sliceHasSymbol(slice: string) {
        return !slice.match(/([0-9]|\.)/);
    }
    export function part1(lines: string[]): number {
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const numberMatches = line.matchAll(/[0-9]+/g);
            console.log(JSON.stringify(numberMatches));
            //
        }
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
            path.join(path.dirname(__filename), './data/y2023_day02.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day02.input'),
            false,
        );

        assert.equal(Y2023_Day02.part1(exampleLines), 4361, 'example 1 part 1');

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day02.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        // assert.equal(part1Result, 2237);

        // part 2
        // assert.equal(Y2023_Day02.part2(exampleLines), 2286, 'example 1 part 2');

        // startMs = Date.now();
        // const part2Result = Y2023_Day02.part2(lines);
        // assert.equal(part2Result, 66681);
        // console.log('part 2', part2Result, 'ms', Date.now() - startMs);
    }

    main().catch((err) => console.error(err));
}
