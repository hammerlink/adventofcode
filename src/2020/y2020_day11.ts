import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';
import {BasicMap, MapEngine, MapLocation} from "../engine/map.engine";
import {Y2020_Day3} from "./y2020_day3";

export namespace Y2020_Day11 {

    export interface PlaneSpace {
        value: string;
        type: 'empty' | 'occupied' | 'floor';
    }

    export function getType(input: string): 'empty' | 'occupied' | 'floor' {
        if (input === '.') return 'floor';
        if (input === '#') return 'occupied';
        if (input === 'L') return 'empty';
        throw new Error('uknown type');
    }

    export function getPointInDirection(map: BasicMap<PlaneSpace>, x: number, y: number,
                                        stepX: number, stepY: number): MapLocation<PlaneSpace> {
        let currentX = x;
        let currentY = y;
        let lastPoint: MapLocation<PlaneSpace> = null;
        do {
            currentX += stepX;
            currentY += stepY;
            lastPoint = MapEngine.getPoint(map, currentX, currentY);

        } while (lastPoint && lastPoint.value.type === 'floor');
        return lastPoint;
    }

    export function getLineOfSightPoints(map: BasicMap<PlaneSpace>, x: number, y: number): MapLocation<PlaneSpace>[] {
        return [
            getPointInDirection(map, x, y, - 1, - 1),
            getPointInDirection(map, x, y, - 1, 0),
            getPointInDirection(map, x, y, - 1, 1),
            getPointInDirection(map, x, y, 0, - 1),
            getPointInDirection(map, x, y, 0, 1),
            getPointInDirection(map, x, y, 1, - 1),
            getPointInDirection(map, x, y, 1, 0),
            getPointInDirection(map, x, y, 1, 1),
        ];
    }

    export function executeSeatRound(map: BasicMap<PlaneSpace>, maxAllowedFilledSeats = 4,
                                     lineOfSight = false): {changeCount: number} {
        let changeCount = 0;
        const originalMap: BasicMap<PlaneSpace> = JSON.parse(JSON.stringify(map));
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                const point = MapEngine.getPoint(map, x, y);
                if (point.value.type === 'floor') continue;
                const adjacentPoints = !lineOfSight ? MapEngine.getAdjacentPoints(originalMap, x, y)
                : getLineOfSightPoints(originalMap, x, y); // instead of adjacent take LoS
                let totalFilledSeats = 0;
                adjacentPoints.forEach(point => {
                    if (point && point.value.type === 'occupied') totalFilledSeats++;
                });
                if (point.value.type === 'empty' && totalFilledSeats === 0) {
                    changeCount++;
                    point.value.value = '#';
                    point.value.type = 'occupied';
                }
                if (point.value.type === 'occupied' && totalFilledSeats >= maxAllowedFilledSeats) {
                    changeCount++;
                    point.value.value = 'L';
                    point.value.type = 'empty';
                }
            }
        }
        return {changeCount};
    }

    export function part1(lines: string[]): number {
        const map = loadMap(lines);

        let lastChangeCount = 0;
        do {
            const changes = executeSeatRound(map);
            lastChangeCount = changes.changeCount;
        } while (lastChangeCount > 0);

        let totalOccupied = 0;
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                const point = MapEngine.getPoint(map, x, y);
                if (point.value.type === 'occupied') totalOccupied++;
            }
        }

        return totalOccupied;
    }

    export function loadMap(lines: string[]): BasicMap<PlaneSpace> {
        const map = MapEngine.newMap<PlaneSpace>();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                MapEngine.setPointInMap(map, x, y, {value: line[x], type: getType(line[x])});
            }
        }
        return map;
    }

    export function part2(lines: string[]): number {
        const map = loadMap(lines);

        let lastChangeCount = 0;
        do {
            const changes = executeSeatRound(map, 5, true);
            lastChangeCount = changes.changeCount;
        } while (lastChangeCount > 0);

        let totalOccupied = 0;
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                const point = MapEngine.getPoint(map, x, y);
                if (point.value.type === 'occupied') totalOccupied++;
            }
        }

        return totalOccupied;
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day11.example'));

        assert.equal(Y2020_Day11.part1(exampleLines), 37, 'example 1 part 1')
        assert.equal(Y2020_Day11.part2(exampleLines), 26, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day11.input'));
        // part 1
        const part1Result = Y2020_Day11.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day11.part2(lines);
        console.log(part2Result);
        // not 2126008, too low

        // assert.equal(part1Result.value, 15353384, 'part 1 competition');
        // assert.equal(part2Result, 2466556, 'part 2 competition');
    }

    main().catch(err => console.error(err));

}
