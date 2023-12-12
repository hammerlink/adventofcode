import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day12 {
    const lineMap = {
        '.': 0,
        '#': 1,
        '?': 2,
    };
    type SpringLine = {
        /** . ? # */
        line: string;
        values: number[];
        checkLine: number[];
    };
    function parseSpringLine(inputLine: string): SpringLine {
        const pieces = inputLine.split(' ');
        const line: string = pieces[0];
        const values = [0, ...line.split('').map((x) => lineMap[x]), 0]; // add trailing 0s
        const checkLine = pieces[1].split(',').map((x) => parseInt(x, 10));
        return { checkLine, line, values };
    }
    function validateSpringLine({ values, checkLine, line }: SpringLine): boolean {
        if (values.includes(2)) throw new Error(`not complete yet ${JSON.stringify(values)}`);
        const parsedLine = values.reduce((t, v) => {
            if (v === 0) return t + '.';
            return t + '#';
        }, '');

        const linePieces = parsedLine
            .replace(/\.+/g, '|')
            .split('|')
            .filter((x) => x.length);
        if (checkLine.length !== linePieces.length) return false;
        for (let i = 0; i < checkLine.length; i++) {
            if (checkLine[i] !== linePieces[i].length) return false;
        }
        // printSpringLine({ values, checkLine, line });
        return true;
    }
    function printSpringLine({ values, checkLine, line }: SpringLine) {
        const parsedLine = values.reduce((t, v) => {
            if (v === 0) return t + '.';
            if (v === 1) return t + '#';
            return t + '?';
        }, '');
        console.log(checkLine, line, ' ', parsedLine);
    }
    enum CheckResult {
        ok_with_options,
        ok_complete,
        error,
    }
    function partialValidateSpringLine({ values, checkLine, line }: SpringLine): CheckResult {
        // check parts from start & end?
        // fill up fixed words
        let currentIndex = 0;
        for (let i = 0; i < checkLine.length; i++) {
            const size = checkLine[i];
            const nextGroup = getNextGroup(values, size, currentIndex);
            if (nextGroup === false) return CheckResult.error;
            if (nextGroup === undefined) return CheckResult.ok_with_options;
            currentIndex = nextGroup.index + nextGroup.slice.length;
            const variableCount = nextGroup.slice.reduce((t, v) => t + (v === 2 ? 1 : 0), 0);
            if (variableCount) {
                // FILL GROUP
                for (let i = 0; i <= size; i++) {
                    const index = nextGroup.index + i;
                    values[index] = i === size ? 0 : 1;
                }
            }
        }
        // if it gets here it is always ok
        return CheckResult.ok_complete;
    }
    function getNextGroup(
        values: number[],
        size: number,
        startIndex: number,
    ): { index: number; slice: number[] } | undefined | false {
        let slice: number[] = [];
        const indexFirstSpring = values.indexOf(1, startIndex);
        const indexFirstUnknown = values.indexOf(2, startIndex);
        if (indexFirstSpring === -1 || indexFirstUnknown < indexFirstSpring) return undefined;
        for (let i = indexFirstSpring; i < values.length; i++) {
            const value = values[i];
            // the first value must be a fixed spring
            if (value !== 0) {
                // 0 = . certain no spring
                slice.push(value);
                if (slice.length >= size) {
                    const nextValue = values[i + 1];
                    if (nextValue !== undefined) slice.push(nextValue);
                    const hasValidEnd = nextValue !== 1; // 1 === # spring
                    if (hasValidEnd) {
                        return { slice, index: indexFirstSpring };
                    } else return false;
                }
            } else {
                return false;
            }
        }
        return undefined;
    }
    function tryAllCombinations(springLine: SpringLine): number {
        const values = [...springLine.values];
        // printSpringLine(springLine);
        let nextIndex = values.indexOf(2);
        if (nextIndex === -1) {
            const isValid = validateSpringLine(springLine);
            return isValid ? 1 : 0;
        }
        const result = partialValidateSpringLine(springLine);
        if (result === CheckResult.error) {
            for (let i = 0; i < springLine.values.length; i++) springLine.values[i] = values[i];
            return 0;
        }
        if (result === CheckResult.ok_complete) {
            for (let i = 0; i < springLine.values.length; i++) springLine.values[i] = values[i];
            return 1;
        }
        nextIndex = values.indexOf(2);
        let counter = 0;
        springLine.values[nextIndex] = 1;
        counter += tryAllCombinations(springLine);
        springLine.values[nextIndex] = 0;
        counter += tryAllCombinations(springLine);
        // reset values
        for (let i = 0; i < springLine.values.length; i++) springLine.values[i] = values[i];
        return counter;
    }
    export function calculateSpringLine(line: string): number {
        const springLine = parseSpringLine(line);
        return tryAllCombinations(springLine);
    }

    export function part1(lines: string[]): number {
        const springLines = lines.map(parseSpringLine);
        return springLines.reduce((t, springLine) => {
            const options = tryAllCombinations(springLine);
            return t + options;
        }, 0);
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

        // assert.equal(Y2023_Day12.calculateSpringLine('???.### 1,1,3'), 1);
        // assert.equal(Y2023_Day12.calculateSpringLine('.??..??...?##. 1,1,3'), 4);
        // assert.equal(Y2023_Day12.calculateSpringLine('?#?#?#?#?#?#?#? 1,3,1,6'), 1);
        // assert.equal(Y2023_Day12.calculateSpringLine('????.#...#... 4,1,1'), 1);
        // assert.equal(Y2023_Day12.calculateSpringLine('????.######..#####. 1,6,5'), 4);
        assert.equal(Y2023_Day12.calculateSpringLine('?###???????? 3,2,1'), 10);

        console.log('part 1 example start');
        assert.equal(Y2023_Day12.part1(exampleLines), 21, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day12.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 8193);

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
