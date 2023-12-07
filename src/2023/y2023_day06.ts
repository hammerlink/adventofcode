import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day06 {
    type Race = { timeMs: number; distanceMm: number };
    function parseLinesToRaces(lines: [string, string]): Race[] {
        const times = Array.from(lines[0].matchAll(/\s(\d+)\s?/g)).map((x) => parseInt(x[1]));
        const distances = Array.from(lines[1].matchAll(/\s(\d+)\s?/g)).map((x) => parseInt(x[1]));
        return times.map((timeMs, index) => ({ timeMs, distanceMm: distances[index] }));
    }

    function calculateWinningPossibilities(race: Race): number {
        let winCounter = 0;
        for (let i = 0; i <= race.timeMs; i++) {
            const { distanceMm } = simulateRace(i, race.timeMs);
            if (distanceMm > race.distanceMm) winCounter++;
        }
        return winCounter;
    }
    function simulateRace(pressTimeMs: number, raceTimeMs: number): { distanceMm: number } {
        const speedMmPerMs = pressTimeMs;
        const remainingTimeMs = raceTimeMs - pressTimeMs;
        const distanceMm = remainingTimeMs * speedMmPerMs;
        return { distanceMm };
    }

    export function part1(lines: string[]): number {
        const races = parseLinesToRaces([lines[0], lines[1]]);
        return races.reduce((t, v) => t * calculateWinningPossibilities(v), 1);
    }

    export function part2(lines: string[]): number {
        const time = parseInt(lines[0].replace(/[^0-9]/g, ''));
        const distance = parseInt(lines[1].replace(/[^0-9]/g, ''));
        // calculate min speed & min duration
        let minTime: number | undefined;
        let maxTime: number | undefined;
        for (let i = 0; i < time; i++) {
            if (minTime === undefined) {
                const rDistance = simulateRace(i, time).distanceMm;
                if (rDistance > distance) {
                    minTime = i;
                    if (maxTime !== undefined) break;
                }
            }
            if (maxTime === undefined) {
                const rDistance = simulateRace(time - i, time).distanceMm;
                if (rDistance > distance) {
                    maxTime = time - i;
                    if (minTime !== undefined) break;
                }
            }
        }
        return maxTime - minTime + 1;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day06.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day06.input'),
            false,
        );

        assert.equal(Y2023_Day06.part1(exampleLines), 288, 'example 1 part 1');

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day06.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 2065338);

        // part 2
        assert.equal(Y2023_Day06.part2(exampleLines), 71503, 'example 1 part 2');

        startMs = Date.now();
        const part2Result = Y2023_Day06.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    }

    main().catch((err) => console.error(err));
}
