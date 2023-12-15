import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day14 {
    function invertLines(lines: string[]): string[] {
        const output: string[] = [];
        const lineLength = lines[0].length;
        for (let i = 0; i < lineLength; i++) {
            let newLine = '';
            lines.forEach((line) => (newLine += line[i]));
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
    export function part1(lines: string[]): number {
        const invertedLines = invertLines(lines);
        const pulledLines = invertedLines.map(pullAllRocks);
        const originalLines = invertLines(pulledLines);
        return originalLines.reduce(
            (total, line, index) => total + Array.from(line.matchAll(/O/g)).length * (lines.length - index),
            0,
        );
    }
    export function part2(lines: string[]): number {
        return 0;
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
        // process.exit(1);

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day14.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 0);
        // part 2
        assert.equal(Y2023_Day14.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day14.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    };

    main().catch((err) => console.error(err));
}
