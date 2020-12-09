import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day9 {

    export function part1(lines: string[], previousNumbers = 5): {value: number, index: number} {
        const numbers = lines.map(line => parseInt(line, 10));
        for (let i = 0; i < numbers.length; i++) {
            const currentNumber = numbers[i];
            if (i < previousNumbers) continue;
            let found = false;
            for (let f = i - previousNumbers; f < i; f++) {
                const firstNumber = numbers[f];
                for (let s = f + 1; s < i; s++) {
                    if (firstNumber + numbers[s] === currentNumber) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (!found) return {value: currentNumber, index: i};
        }
        return null;
    }

    export function part2(lines: string[], previousNumbers = 5): number {
        const numbers = lines.map(line => parseInt(line, 10));
        const invalidNumber = part1(lines, previousNumbers);
        for (let i = 0; i < invalidNumber.index; i++) {
            let total = numbers[i];
            for (let y = i + 1; y < invalidNumber.index; y++) {
                total += numbers[y];
                if (total > invalidNumber.value) break;
                if (total === invalidNumber.value) {
                    const values = numbers.slice(i, y + 1);
                    values.sort((a, b) => a - b);
                    return values.shift() + values.pop();
                }
            }
        }
        return null;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day9.example'));
        assert.equal(Y2020_Day9.part1(exampleLines, 5).value, 127, 'example 1 part 1')
        assert.equal(Y2020_Day9.part2(exampleLines, 5), 62, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day9.input'));
        // part 1
        const part1Result = Y2020_Day9.part1(lines, 25);
        console.log(part1Result.value);

        // part 2
        const part2Result = Y2020_Day9.part2(lines, 25);
        console.log(part2Result);
        // not 2126008, too low

        assert.equal(part1Result.value, 15353384, 'part 1 competition');
        assert.equal(part2Result, 2466556, 'part 2 competition');
    }

    main().catch(err => console.error(err));

}
