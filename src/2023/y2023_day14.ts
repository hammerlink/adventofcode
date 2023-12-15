import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day14 {
    const valueMap = {
        '.': 0,
        O: 1,
        '#': 2,
    };
    const reverseMap = {};
    Object.keys(valueMap).forEach((key) => (reverseMap[valueMap[key]] = key));

    type Raster = number[][];
    function convertLinesToRaster(lines: string[]): Raster {
        return lines.map((line) => {
            const output: number[] = [];
            for (let i = 0; i < line.length; i++) {
                output.push(valueMap[line[i]]);
            }
            return output;
        });
    }
    function pullNorth(raster: Raster) {
        const amount = raster.length;
        for (let x = 0; x < amount; x++) {
            let rockCount = 0;
            let startIndex = 0;
            for (let y = 0; y < amount; y++) {
                const value = raster[y][x];
                if (value === 1) rockCount++;
                else if (value === 2) {
                    // SET ALL ROCKS
                    for (let i = startIndex; i < y; i++) {
                        raster[i][x] = i < startIndex + rockCount ? 1 : 0;
                    }
                    rockCount = 0;
                    startIndex = y + 1;
                }
            }
            // SET ALL ROCKS
            for (let i = startIndex; i < amount; i++) {
                raster[i][x] = i < startIndex + rockCount ? 1 : 0;
            }
        }
    }
    function pullSouth(raster: Raster) {
        const amount = raster.length;
        for (let x = 0; x < amount; x++) {
            let rockCount = 0;
            let startIndex = amount - 1;
            for (let y = amount - 1; y >= 0; y--) {
                const value = raster[y][x];
                if (value === 1) rockCount++;
                else if (value === 2) {
                    // SET ALL ROCKS
                    for (let i = startIndex; i > y; i--) {
                        raster[i][x] = i > startIndex - rockCount ? 1 : 0;
                    }
                    rockCount = 0;
                    startIndex = y - 1;
                }
            }
            // SET ALL ROCKS
            for (let i = startIndex; i >= 0; i--) {
                raster[i][x] = i > startIndex - rockCount ? 1 : 0;
            }
        }
    }
    function pullWest(raster: Raster) {
        const amount = raster.length;
        for (let y = 0; y < amount; y++) {
            let rockCount = 0;
            let startIndex = 0;
            for (let x = 0; x < amount; x++) {
                const value = raster[y][x];
                if (value === 1) rockCount++;
                else if (value === 2) {
                    // SET ALL ROCKS
                    for (let i = startIndex; i < x; i++) {
                        raster[y][i] = i < startIndex + rockCount ? 1 : 0;
                    }
                    rockCount = 0;
                    startIndex = x + 1;
                }
            }
            // SET ALL ROCKS
            for (let i = startIndex; i < amount; i++) {
                raster[y][i] = i < startIndex + rockCount ? 1 : 0;
            }
        }
    }
    function pullEast(raster: Raster) {
        const amount = raster.length;
        for (let y = 0; y < amount; y++) {
            let rockCount = 0;
            let startIndex = amount - 1;
            for (let x = amount - 1; x >= 0; x--) {
                const value = raster[y][x];
                if (value === 1) rockCount++;
                else if (value === 2) {
                    // SET ALL ROCKS
                    for (let i = startIndex; i > x; i--) {
                        raster[y][i] = i > startIndex - rockCount ? 1 : 0;
                    }
                    rockCount = 0;
                    startIndex = x - 1;
                }
            }
            // SET ALL ROCKS
            for (let i = startIndex; i >= 0; i--) {
                raster[y][i] = i > startIndex - rockCount ? 1 : 0;
            }
        }
    }
    function printRaster(raster: Raster) {
        console.log();
        for (let y = 0; y < raster.length; y++) {
            const subRaster = raster[y];
            let line = '';
            for (let x = 0; x < subRaster.length; x++) line += reverseMap[`${subRaster[x]}`];
            console.log(line);
        }
    }

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
    function pullAllRocks(line: string): string {
        const pieces = line.split('#');
        return pieces
            .map((piece) => {
                const length = piece.length;
                const countRocks = Array.from(piece.matchAll(/O/g)).length;
                let output = '';
                for (let i = 0; i < countRocks; i++) output += 'O';
                while (output.length < length) output += '.';
                return output;
            })
            .join('#');
    }
    function calculateRasterWeight(raster: Raster): number {
        const amount = raster.length;
        let total = 0;
        for (let y = 0; y < amount; y++) {
            const weight = amount - y;
            let rockCount = 0;
            for (let x = 0; x < amount; x++) {
                const value = raster[y][x];
                if (value === 1) rockCount++;
            }
            total += weight * rockCount;
        }
        return total;
    }
    export function part1(lines: string[]): number {
        const raster = convertLinesToRaster(lines);
        // printRaster(raster);
        pullNorth(raster);
        // printRaster(raster);
        return calculateRasterWeight(raster);
        // const invertedLines = invertLines(lines);
        // const pulledLines = invertedLines.map(pullAllRocks);
        // const originalLines = invertLines(pulledLines);
        // return originalLines.reduce(
        //     (total, line, index) => total + Array.from(line.matchAll(/O/g)).length * (lines.length - index),
        //     0,
        // );
    }
    function printField(lines: string[], id: string) {
        console.log();
        console.log(id);
        lines.forEach((line) => console.log(line));
    }
    function flipNorth(lines: string[]): string[] {
        return invertLines(lines);
    }
    function flipWest(lines: string[]): string[] {
        return invertLines(lines);
    }
    function flipSouth(lines: string[]): string[] {
        return invertLines(lines, true);
    }
    function flipEast(lines: string[]): string[] {
        return invertLines(lines, true, true);
    }
    function executeCycleOld(lines: string[]): string[] {
        // printField(lines, 'initial');

        lines = flipNorth(lines).map(pullAllRocks);
        // printField(lines, 'north');

        lines = flipWest(lines).map(pullAllRocks);
        // printField(lines, 'west');

        lines = flipSouth(lines).map(pullAllRocks);
        // printField(lines, 'south');
        // printField(invertLines(lines), 'test 1');
        // printField(invertLines(lines, true), 'test 2');
        // printField(invertLines(lines, false, true), 'test 3');
        // printField(invertLines(lines, true, true), 'test 4');

        lines = flipEast(lines).map(pullAllRocks);
        // printField(lines, 'east');

        lines = lines.map((line) => line.split('').reverse().join(''));
        // printField(lines, 'original');

        return lines;
    }
    function isRecurringDelta(input: number[]): number | undefined {
        const delta = input[1] - input[0];
        for (let i = 2; i < input.length; i++) if (input[i] - input[i - 1] !== delta) return undefined;
        return delta;
    }

    function executeCycle(raster: Raster) {
        pullNorth(raster);
        pullWest(raster);
        pullSouth(raster);
        pullEast(raster);
    }
    export function part2(lines: string[]): number {
        const weightMap: { [weight: number]: { cycleList: number[] } } = {};
        const cycles = 1000000000;
        const base = 100;
        let counter = 0;
        const printInterval = cycles / base;
        const raster = convertLinesToRaster(lines);
        let start = Date.now();
        let hasJumped = false;
        for (let i = 0; i < cycles; i++) {
            executeCycle(raster);
            const weight = calculateRasterWeight(raster);
            if (!weightMap[weight]) weightMap[weight] = { cycleList: [] };
            const { cycleList } = weightMap[weight];
            cycleList.push(i);

            if (!hasJumped && cycleList.length > 9) {
                const recurringDelta = isRecurringDelta(cycleList.slice(-10));
                if (recurringDelta !== undefined) {
                    console.log('recurring pattern encountered', recurringDelta, JSON.stringify(cycleList.slice(-10)));
                    hasJumped = true;
                    const base = cycles - i - 1;
                    const factor = Math.floor(base / recurringDelta);
                    i = i + factor * recurringDelta;
                }
            }

            if (i && i % printInterval === 0) {
                counter++;
                console.log(counter, Date.now() - start, 'ms');
                start = Date.now();
            }
        }
        return calculateRasterWeight(raster);
    }
}

if (!module.parent) {
    const path = require('path');

    const main = async () => {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day14.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day14.input'),
            false,
        );

        console.log('part 1 example start');
        assert.equal(Y2023_Day14.part1(exampleLines), 136, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day14.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 107951);
        // part 2
        assert.equal(Y2023_Day14.part2(exampleLines), 64, 'example part 2');
        // process.exit(1);

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day14.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 95736);
    };

    main().catch((err) => console.error(err));
}
