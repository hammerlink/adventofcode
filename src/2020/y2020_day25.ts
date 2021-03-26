import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day25 {
    export function calculateLoopSize(endValue: number, subject: number = 7) {
        let loopSize = 1;
        let value = 1;
        while (true) {
            let newValue = value * subject;
            newValue = newValue % 20201227;
            if (newValue == endValue) return loopSize;
            loopSize++;
            value = newValue;
        }
        return loopSize;
    }

    export function executeLoopSize(subject: number, loopSize: number): number {
        let output = 1;
        for (let i = 0; i < loopSize; i++) {
            output = output * subject;
            output = output % 20201227;
        }
        return output;
    }

    export function part1(cardKey: number, doorKey: number): number {
        const cardLoopSize = calculateLoopSize(cardKey);
        const doorLoopSize = calculateLoopSize(doorKey);
        // const cardEncryptionKey = calculateLoopSize(doorKey, cardLoopSize);
        return executeLoopSize(doorKey, cardLoopSize);
        // return calculateLoopSize(cardKey, doorLoopSize);
    }

    export function part2(key1: number, key2: number): number {
        return null;
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        assert.strictEqual(Y2020_Day25.calculateLoopSize(5764801), 8);
        assert.strictEqual(Y2020_Day25.calculateLoopSize(17807724), 11);
        assert.strictEqual(Y2020_Day25.part1(5764801, 17807724), 14897079, 'example 1 part 1');

        // const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/Y2020_Day25.input'), false);
        // part 1
        const part1Result = Y2020_Day25.part1(8252394, 6269621);
        console.log(part1Result);
    }

    main().catch(err => console.error(err));
}
