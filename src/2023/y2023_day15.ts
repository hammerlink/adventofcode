import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day15 {
    export function calculateHash(line: string): number {
        let currentValue = 0;
        for (let i = 0; i < line.length; i++) {
            currentValue = (currentValue + line.charCodeAt(i)) * 17;
            currentValue = currentValue % 256;
        }
        return currentValue;
    }
    export function part1(lines: string[]): number {
        return lines.reduce((t, line) => {
            return t + line.split(',').reduce((t1, v) => t1 + calculateHash(v), 0);
        }, 0);
    }
    type Command = {
        raw: string;
        label: string;
        isAdd: boolean;
        boxId: number;
        focalLength?: number;
    };
    function parseCommand(raw: string): Command {
        const match = raw.match(/(.*)([=-])([0-9]*)/);
        const label = match[1];
        const isAdd = match[2] === '=';
        const focalLength = match[3] ? parseInt(match[3]) : undefined;
        return { raw, isAdd, boxId: calculateHash(label), focalLength, label };
    }

    function printHashMap(hashMap: HashMap) {
        console.log();
        Object.keys(hashMap).forEach((rawBoxId) => {
            let output = `Box ${rawBoxId}: `;
            const boxId = parseInt(`${rawBoxId}`);
            const box: MapBox = hashMap[rawBoxId];
            box.slots.forEach((boxSlot) => {
                output += ` [${boxSlot.label} ${boxSlot.focalLength}]`;
            });
            console.log(output);
        });
    }

    type BoxSlot = { label: string; focalLength: number };
    type MapBox = { slots: BoxSlot[] };
    type HashMap = { [boxId: number]: MapBox };
    export function part2(lines: string[]): number {
        const hashMap: HashMap = {};
        const commands = lines[0].split(',').map(parseCommand);
        commands.forEach(({ boxId, isAdd, focalLength, label }) => {
            if (!hashMap[boxId]) hashMap[boxId] = { slots: [] };
            const mapBox = hashMap[boxId];
            const labelBox = mapBox.slots.find((x) => x.label === label);
            if (!isAdd) {
                if (!!labelBox) {
                    // remove existing label
                    const index = mapBox.slots.indexOf(labelBox);
                    mapBox.slots.splice(index, 1);
                }
            } else {
                if (labelBox) labelBox.focalLength = focalLength;
                else mapBox.slots.push({ label, focalLength });
            }
            // printHashMap(hashMap);
        });

        return Object.keys(hashMap).reduce((total, rawBoxId) => {
            let boxValue = 0;
            const boxId = parseInt(`${rawBoxId}`);
            const box: MapBox = hashMap[rawBoxId];
            box.slots.forEach((boxSlot, index) => {
                const result = (boxId + 1) * (index + 1) * boxSlot.focalLength;
                console.log(boxId, result);
                boxValue += result;
            });
            return total + boxValue;
        }, 0);
    }
}

if (!module.parent) {
    const path = require('path');

    const main = async () => {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day15.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day15.input'),
            false,
        );

        assert.equal(Y2023_Day15.calculateHash('HASH'), 52);
        assert.equal(Y2023_Day15.calculateHash('rn=1'), 30);
        assert.equal(Y2023_Day15.calculateHash('rn'), 0);
        assert.equal(Y2023_Day15.calculateHash('cm'), 0);
        assert.equal(Y2023_Day15.calculateHash('qp'), 1);

        console.log('part 1 example start');
        assert.equal(Y2023_Day15.part1(exampleLines), 1320, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day15.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 509167);
        // part 2
        assert.equal(Y2023_Day15.part2(exampleLines), 145, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day15.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 259333);
    };

    main().catch((err) => console.error(err));
}
