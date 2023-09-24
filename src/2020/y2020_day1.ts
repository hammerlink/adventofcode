import {FileEngine} from '../engine/file.engine';
import { getTestModel1 } from 'rs-lib';

export namespace Y2020_Day1 {

    export function get2020Entries(input: number[]) {
        for (let i = 0; i < input.length; i++) {
            const first = input[i];
            for (let j = i + 1; j < input.length; j++) {
                const second = input[j];
                if (first + second === 2020) return first * second;
            }
        }
    }

    export function get2020Entries3(input: number[]) {
        for (let i = 0; i < input.length; i++) {
            const first = input[i];
            for (let j = i + 1; j < input.length; j++) {
                const second = input[j];
                for (let x = j + 1; x < input.length; x++) {
                    const third = input [x];
                    if (first + second + third === 2020) return first * second * third;
                }
            }
        }
    }
}

if (!module.parent) {

    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day1.input'));
        const input = lines.map(i => parseInt(i, 10));
        const startMs = Date.now();
        console.log(Y2020_Day1.get2020Entries(input))
        const nextMs = Date.now();
        console.log('part 1 time', nextMs - startMs);
        console.log(Y2020_Day1.get2020Entries3(input))
        console.log('part 2 time', Date.now() - nextMs);
    }

    main().catch(err => console.error(err));

}
