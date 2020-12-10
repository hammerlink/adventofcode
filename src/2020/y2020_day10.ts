import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day10 {

    export function part1(lines: string[]): number {
        const numbers = lines.map(line => parseInt(line, 10));
        numbers.sort((a, b) => a - b);

        let currentJolt = 0;
        const joltDeltas: {[joltDelta: number]: {count: number}} = {1: {count: 0}, 2: {count: 0}, 3: {count: 0}};
        for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];
            const delta = number - currentJolt;
            joltDeltas[delta].count++;
            currentJolt = number;
        }
        joltDeltas[3].count++;
        return joltDeltas[1].count * joltDeltas[3].count;
    }

    export function part2(lines: string[]): number {
        const adapterMapping: {[adapterJoltIndex: number]: {possibilities: number}} = {};

        const numbers = lines.map(line => parseInt(line, 10));
        numbers.sort((a, b) => a - b);
        numbers.unshift(0);
        numbers.push(numbers[numbers.length - 1] + 3);

        for (let i = 0; i < numbers.length; i++) {
            const index = numbers.length - 1 -i;
            if (!adapterMapping[index]) calculatePossibilities(index, numbers, adapterMapping);
        }
        return adapterMapping[0].possibilities;
    }

    export function calculatePossibilities(index: number, list: number[], adapterMapping: {[adapterJoltIndex: number]: {possibilities: number}}) {
        // get possible connections
        const originalNumber = list[index];
        const possibleConnectionIndeces = [];
        for (let i = index + 1; i < list.length - 1; i++) {
            const number = list[i];
            if (originalNumber === number) continue;
            if (number > originalNumber + 3) break;
            possibleConnectionIndeces.push(i);
        }
        let totalPossibilities = possibleConnectionIndeces.length ? possibleConnectionIndeces.length : 1;

        possibleConnectionIndeces.forEach(i => {
            if (adapterMapping[i].possibilities > 1) {
                totalPossibilities += adapterMapping[i].possibilities - 1;
            }
        });
        adapterMapping[index] = {possibilities: totalPossibilities};
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day10.example'));
        assert.equal(Y2020_Day10.part1(exampleLines), 35, 'example 1 part 1')
        assert.equal(Y2020_Day10.part2(exampleLines), 8, 'example 1 part 2')
        const exampleLines1 = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day10_1.example'));
        assert.equal(Y2020_Day10.part1(exampleLines1), 220, 'example 1 part 1')
        assert.equal(Y2020_Day10.part2(exampleLines1), 19208, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day10.input'));
        // part 1
        const part1Result = Y2020_Day10.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day10.part2(lines);
        console.log(part2Result);
        // not 2126008, too low

        // assert.equal(part1Result.value, 15353384, 'part 1 competition');
        // assert.equal(part2Result, 2466556, 'part 2 competition');
    }

    main().catch(err => console.error(err));

}
