import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day12 {
    type SpringLine = {
        /** . ? # */
        line: string;
        checkLine: number[];
    };
    function parseSpringLine(inputLine: string): SpringLine {
        const pieces = inputLine.split(' ');
        const line: string = pieces[0];
        const checkLine = pieces[1].split(',').map((x) => parseInt(x, 10));
        return { checkLine, line };
    }
    function validateSpringLine({ line, checkLine }: SpringLine): boolean {
        if (line.includes('?')) throw new Error(`not complete yet ${line}`);
        const linePieces = line
            .replace(/\.+/g, '|')
            .split('|')
            .filter((x) => x.length);
        if (checkLine.length !== linePieces.length) return false;
        for (let i = 0; i < checkLine.length; i++) {
            if (checkLine[i] !== linePieces[i].length) return false;
        }
        return true;
    }
    function tryAllCombinations(springLine: SpringLine): number {
        const nextIndex = springLine.line.indexOf('?');
        if (nextIndex === -1) {
            const isValid = validateSpringLine(springLine);
            return isValid ? 1 : 0;
        }
        let counter = 0;
        const rawLine = [...springLine.line];
        rawLine[nextIndex] = '.';
        springLine.line = rawLine.join('');
        counter += tryAllCombinations(springLine);
        rawLine[nextIndex] = '#';
        springLine.line = rawLine.join('');
        counter += tryAllCombinations(springLine);
        return counter;
    }

    export function part1(lines: string[]): number {
        const springLines = lines.map(parseSpringLine);
        return springLines.reduce((t, springLine) => t + tryAllCombinations(springLine), 0);
    }

    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day12.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day12.input'),
            false,
        );

        console.log('part 1 example start');
        assert.equal(Y2023_Day12.part1(exampleLines), 21, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day12.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 0);

        // part 2
        assert.equal(Y2023_Day12.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day12.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    }

    main().catch((err) => console.error(err));
}
