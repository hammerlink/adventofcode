import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day09 {
    type Sequence = {
        initialValues: number[];
        values: number[][];
    };
    function parseSequence(line: string): Sequence {
        const values = line.split(' ').map((x) => parseInt(x, 10));
        return { initialValues: values, values: [values] };
    }
    function getSequenceDeltas(sequenceValues: number[]): number[] {
        const output: number[] = [];
        sequenceValues.forEach((v, i) => {
            if (i === 0) return;
            output.push(v - sequenceValues[i - 1]);
        });

        return output;
    }
    function calculateSequence(sequence: Sequence) {
        while (!sequence.values[sequence.values.length - 1].every((x) => x === 0)) {
            sequence.values.push(getSequenceDeltas(sequence.values[sequence.values.length - 1]));
        }
    }
    function calculateNext(sequence: Sequence): number {
        let lastAdded: number | undefined;
        for (let i = 0 ; i < sequence.values.length; i++) {
            let index = sequence.values.length - 1 -i;
            const values = sequence.values[index];
            const lastValue = values[values.length - 1];
            lastAdded = lastValue + (lastAdded ?? 0);
            values.push(lastAdded);
        }
        return lastAdded;
    }
    export function part1(lines: string[]): number {
        const sequences = lines.map(parseSequence);
        sequences.forEach(calculateSequence);
        return sequences.reduce((t, sequence) => t + calculateNext(sequence), 0);
    }

    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day09.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day09.input'),
            false,
        );

        assert.equal(Y2023_Day09.part1(exampleLines), 114, 'example part 1');

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day09.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 0);

        // part 2
        assert.equal(Y2023_Day09.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day09.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    }

    main().catch((err) => console.error(err));
}
