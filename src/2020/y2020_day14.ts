import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day14 {
    export function byteStrToNumber(input: string): number {
        let total = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[input.length - 1 - i] === '1') total += Math.pow(2, i);
        }
        return total;
    }

    export function numberToByteStr(input: number, maxBit = 35): string {
        let residue = input;
        let output = '';
        let currentBit = maxBit;
        while (residue > 0 && currentBit >= 0) {
            const bitPow = Math.pow(2, currentBit);
            if (residue >= bitPow) {
                residue -= bitPow;
                output += '1';
            } else output += '0';

            currentBit--;
        }
        for (let i = output.length; i < maxBit + 1; i++) output += '0';
        return output;
    }

    export function applyMask(bitStr: string, mask: string) {
        if (bitStr.length !== mask.length) throw new Error(`mismatching bit length ${bitStr.length} ${bitStr} ${mask.length} ${mask}`);
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] !== 'X') bitStr = bitStr.substr(0, i) + mask[i] + bitStr.substr(i + 1);
        }
        return bitStr;
    }

    export function parseLine(line: string): {mask?: string, memorySlot?: number, value?: number} {
        if (line.startsWith('mask')) {
            return {mask: line.match(/mask \= (.*)/)[1]};
        }
        const result = line.match(/mem\[(\d+)\] = (\d+)/);
        return {memorySlot: parseInt(result[1], 10), value: parseInt(result[2], 10)};
    }


    export function part1(lines: string[]): number {
        const memory: { [memorySlot: number]: number } = {};
        let mask: string = null;

        lines.forEach(line => {
            const task = parseLine(line);
            if (task.mask) {
                mask = task.mask;
                return;
            }
            let value = numberToByteStr(task.value);
            if (mask) value = applyMask(value, mask);
            memory[task.memorySlot] = byteStrToNumber(value);
        });

        let total = 0;
        for (const slot in memory) total += memory[slot];
        return total;
    }

    export function getMemoryAddresses(bitStr: string, mask: string): number[] {
        if (bitStr.length !== mask.length) throw new Error(`mismatching bit length ${bitStr.length} ${bitStr} ${mask.length} ${mask}`);
        const floatingIndices: number[] = [];
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === '0') continue;
            if (mask[i] === 'X') floatingIndices.push(i);
            bitStr = bitStr.substr(0, i) + mask[i] + bitStr.substr(i + 1);
        }
        return runThroughFloatingAddress(bitStr);
    }

    export function runThroughFloatingAddress(bitStr: string, minIndex = 32): number[] {
        const firstIndex = bitStr.indexOf('X');
        if (firstIndex === -1) return [byteStrToNumber(bitStr)];
        let output: number[] = [];
        output = output.concat(runThroughFloatingAddress(bitStr.substr(0, firstIndex) + '0' + bitStr.substr(firstIndex + 1)));
        output = output.concat(runThroughFloatingAddress(bitStr.substr(0, firstIndex) + '1' + bitStr.substr(firstIndex + 1)));
        return output;
    }

    export function part2(lines: string[]): number {
        const memory: { [memorySlot: number]: number } = {};
        let mask: string = null;

        lines.forEach(line => {
            const task = parseLine(line);
            if (task.mask) {
                mask = task.mask;
                return;
            }
            let memoryAddress = numberToByteStr(task.memorySlot);
            if (mask) {
                const parsedMemoryAddresses = getMemoryAddresses(memoryAddress, mask);
                parsedMemoryAddresses.forEach(memoryAddress => {
                    memory[memoryAddress] = task.value;
                });
            }
        });

        let total = 0;
        for (const slot in memory) total += memory[slot];
        return total;
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        assert.equal(Y2020_Day14.numberToByteStr(11), '000000000000000000000000000000001011');
        assert.equal(Y2020_Day14.numberToByteStr(0), '000000000000000000000000000000000000');
        assert.equal(Y2020_Day14.byteStrToNumber('000000000000000000000000000001100101'), 101);

        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day14.example'));

        assert.equal(Y2020_Day14.part1(exampleLines), 165, 'example 1 part 1');

        const exampleLines1 = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day14.example_1'));
        assert.equal(Y2020_Day14.part2(exampleLines1), 208, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day14.input'));
        // part 1
        const part1Result = Y2020_Day14.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day14.part2(lines);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
