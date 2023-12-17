import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';
import { BasicMap, MapEngine, MapLocation } from '../engine/map.engine';

export namespace Y2023_Day17 {
    type CityBlock = {
        value: string;
        isEnergized?: boolean;
        entries: {
            [direction: string]: {
                [step: number]: {
                    minRequiredHeatLoss?: number;
                    minCurrentHeatLoss?: number;
                };
            };
        };
    };
    type CityMap = BasicMap<CityBlock>;
    const Directions = { north: 'north', east: 'east', south: 'south', west: 'west' };
    type Directions = (typeof Directions)[keyof typeof Directions];
    const directionMap: { [direction: string]: { x: number; y: number } } = {
        north: { x: 0, y: -1 },
        east: { x: 1, y: 0 },
        south: { x: 0, y: 1 },
        west: { x: -1, y: 0 },
    };
    export function part1(lines: string[]): number {
        return 0;
    }
    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    const main = async () => {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day17.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day17.input'),
            false,
        );

        console.log('part 1 example start');
        assert.equal(Y2023_Day17.part1(exampleLines), 0, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day17.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 0);
        // part 2
        assert.equal(Y2023_Day17.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day17.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    };

    main().catch((err) => console.error(err));
}
