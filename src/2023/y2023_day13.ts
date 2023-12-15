import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day13 {
    function invertLines(lines: string[], reverse = false, loopReverse = false): string[] {
        const output: string[] = [];
        const lineLength = lines[0].length;
        for (let i = 0; i < lineLength; i++) {
            const lineIndex = loopReverse ? lineLength - 1 - i : i;
            let newLine = '';
            lines.forEach((line) => (newLine = reverse ? line[lineIndex] + newLine : newLine + line[lineIndex]));
            output.push(newLine);
        }
        return output;
    }
    function getMirrorIndex(lines: string[]): number | undefined {
        console.log();
        lines.forEach((line) => console.log(line));
        const max = lines[0].length;
        for (let i = 1; i < max; i++) {
            let isTotalMirror = true;
            for (let y = 0; y < lines.length; y++) {
                const line = lines[y];
                const leftPart = line.substring(0, i);
                const rightPart = line.substring(i);
                const isMirror =
                    leftPart.length > rightPart.length
                        ? leftPart.endsWith(rightPart.split('').reverse().join(''))
                        : rightPart.startsWith(leftPart.split('').reverse().join(''));
                if (!isMirror) {
                    isTotalMirror = false;
                    break;
                }
            }
            if (isTotalMirror) return i;
        }

        return undefined;
    }
    export function calculateMirrorValue(lines: string[]): number {
        const originalLines = lines;
        // return directly
        const horizontalMirrorIndex = getMirrorIndex(lines);
        if (horizontalMirrorIndex !== undefined) return horizontalMirrorIndex;

        // multiply 100
        lines = invertLines(lines);
        const verticalMirrorIndex = getMirrorIndex(lines);
        if (verticalMirrorIndex === undefined) {
            console.log();
            originalLines.forEach((line) => console.log(line));
            throw new Error('no mirror found');
        }
        return verticalMirrorIndex * 100;

        return 0;
    }
    function iterateMaps(lines: string[]): string[][] {
        const maps: string[][] = [];
        let currentMap: string[] = [];
        lines.forEach((line) => {
            if (!line.length) {
                if (currentMap.length) maps.push(currentMap);
                currentMap = [];
                return;
            }
            currentMap.push(line);
        });
        maps.push(currentMap);
        return maps;
    }
    export function part1(lines: string[]): number {
        const maps = iterateMaps(lines);
        return maps.reduce((t, mapLines) => t + calculateMirrorValue(mapLines), 0);
    }

    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    const main = async () => {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day13.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day13.input'),
            false,
        );

        const issue = `#..#.#.###..#.#.#
#.#..##.#.#####.#
####.#####.#.....
####.#####.#.....
#.#..##.#.#####.#
#..###.###..#.#.#
..#.#.#.....##.##
.#.#..##.##..##..
.#.#..##.##..##..`;
        Y2023_Day13.calculateMirrorValue(issue.split('\n'));
        console.log('part 1 example start');
        assert.equal(Y2023_Day13.part1(exampleLines), 405, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day13.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 0);
        // part 2
        assert.equal(Y2023_Day13.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day13.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 0);
    };

    main().catch((err) => console.error(err));
}
