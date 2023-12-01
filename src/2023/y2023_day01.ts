import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day01 {
    export function part1(lines: string[]): number {
        return lines
            .filter((x) => !!x)
            .map((x) => {
                const digits = Array.from(x.matchAll(/[0-9]/g));
                return parseInt(`${digits[0]}${digits.pop()}`);
            })
            .reduce((t, v) => t + v, 0);
    }

    const writtenLetters = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    function convertDigitMatch(value: string): string {
        if (value.length === 1) return value;
        return `${writtenLetters.indexOf(value) + 1}`;
    }
    export function part2(lines: string[]): number {
        return lines
            .filter((x) => !!x)
            .map((x, index) => {
                const regex = new RegExp(`([0-9]|${writtenLetters.join('|')})`);
                let lineIndex = 0;
                const digits: string[] = [];
                let match: RegExpMatchArray;
                do {
                    match = x.slice(lineIndex).match(regex);
                    if (match) {
                        const value = match[0];
                        lineIndex += match.index + 1;
                        digits.push(convertDigitMatch(value));
                    } else {
                        break;
                    };
                } while (!!match);
                // real first & last digit
                const value = parseInt(`${digits[0]}${digits[digits.length - 1]}`);
                // console.log(index, value, JSON.stringify(digits), x);
                return value;
            })
            .reduce((t, v) => t + v, 0);
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day01.example'),
            false,
        );

        assert.equal(Y2023_Day01.part1(exampleLines), 142, 'example 1 part 1');

        const exampleLines2 = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day01.example2'),
            false,
        );
        assert.equal(Y2023_Day01.part2(exampleLines2), 281, 'example 1 part 2');

        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day01.input'),
            false,
        );
        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day01.part1(lines);
        assert.equal(part1Result, 54573);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);

        // part 2
        startMs = Date.now();
        const part2Result = Y2023_Day01.part2(lines);
        assert.equal(part2Result < 54623, true, `first attempt to high ${part2Result}`);
        assert.equal(part2Result < 54600, true, `attempt to high ${part2Result}`);
        assert.equal(part2Result > 54000, true, `attempt to low ${part2Result}`);
        // issue found, overlapping regex f.e nineight will only find nine
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
    }

    main().catch((err) => console.error(err));
}
