import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day13 {

    export function parseInput(lines: string[]): {earliestTime: number, busIDs: number[]} {
        const earliestTime = parseInt(lines[0], 10);
        const busIDs = lines[1].split(',').filter(v => v!== 'x').map(v => parseInt(v, 10));
        return {earliestTime, busIDs};
    }

    export function parseInputPart2(lines: string[]): {earliestTime: number, busIDs: {id: number, index: number, base?: number }[]} {
        const earliestTime = parseInt(lines[0], 10);
        const rawBusIDs = lines[1].split(',');
        const busIDs: {id: number, index: number }[] = [];
        for (let i = 0; i < rawBusIDs.length; i++) {
            const v = rawBusIDs[i];
            if (v === 'x') continue;
            busIDs.push({id: parseInt(v, 10), index: i});
        }
        return {earliestTime, busIDs};
    }

    export function part1(lines: string[]): number {
        const configuration = parseInput(lines);
        let closestBusIdTime = null;
        let busId;
        configuration.busIDs.forEach(id => {
            const time = Math.ceil(configuration.earliestTime / id);
            const closestTime = id * time ;
            if (closestBusIdTime === null || closestTime < closestBusIdTime) {
                closestBusIdTime = closestTime;
                busId = id;
            }
        })

        return (closestBusIdTime - configuration.earliestTime) * busId;
    }

    export function getBaseJump(base: {id: number, index: number }, current: {id: number, index: number }): number {
        let firstFound = null;
        let multiplyCounter = 1;
        while (true) {
            const startTime = base.id * multiplyCounter - base.index;
            if ((startTime + current.index) % current.id === 0) {
                if (!firstFound) {
                    firstFound = multiplyCounter;
                    multiplyCounter++;
                    continue;
                }
                return multiplyCounter - firstFound;
            }
            multiplyCounter++;
        }
    }

    function lcm_two_numbers(x, y): number {
        return (!x || !y) ? 0 : Math.abs((x * y) / gcd_two_numbers(x, y));
    }

    function gcd_two_numbers(x, y) {
        x = Math.abs(x);
        y = Math.abs(y);
        while(y) {
            let t = y;
            y = x % y;
            x = t;
        }
        return x;
    }

    export function part2(lines: string[], startMultiply = 1): number {
        const configuration = parseInputPart2(lines);
        configuration.busIDs.sort((a, b) => b.id - a.id);
        const {busIDs} = configuration;
        const biggestId = configuration.busIDs[0];
        let multiplyCounter = startMultiply;
        let biggestStartTime = null;
        const previousIndices = {};
        for (let i = 1; i < busIDs.length; i++) {
            const busID = busIDs[i];
            busID.base = getBaseJump(biggestId, busID);
        }
        console.log(busIDs);
        let jump = 1;
        while (!biggestStartTime) {
            let valid = true;
            const startTime = biggestId.id * multiplyCounter - biggestId.index;
            for (let i = 1; i < busIDs.length; i++) {
                const busId = busIDs[i];
                if ((startTime + busId.index) % busId.id !== 0) {
                    valid = false;
                    break;
                }
                let firstTime = false;
                if (!previousIndices[i]) {
                    previousIndices[i] = {base: 0, current: 0};
                    firstTime = true;
                }
                console.log(i, multiplyCounter, (startTime + busId.index) / busId.id,
                    multiplyCounter - previousIndices[i].base, (startTime + busId.index) / busId.id - previousIndices[i].current);
                previousIndices[i].base = multiplyCounter;
                previousIndices[i].current = (startTime + busId.index) / busId.id;
                if (firstTime) jump = lcm_two_numbers(jump, busId.base);
            }
            if (valid) {
                biggestStartTime = startTime;
                break;
            }
            multiplyCounter += jump;
        }
        return biggestStartTime
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day13.example'));

        assert.equal(Y2020_Day13.part1(exampleLines), 295, 'example 1 part 1')
        // assert.equal(Y2020_Day13.part2(exampleLines), 1068781, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day13.input'));
        // part 1
        const part1Result = Y2020_Day13.part1(lines);
        console.log(part1Result);

        console.log(Y2020_Day13.getBaseJump({ id: 937, index: 72 }, { id: 659, index: 41 })); // 659 937


        // part 2
        const part2Result = Y2020_Day13.part2(lines, 0); //106723585913
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
