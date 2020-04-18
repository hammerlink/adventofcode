import {FileEngine} from "../engine/file.engine";

export namespace Day10 {
    export interface MapLocation {
        x: number;
        y: number;
        isAsteroid: boolean;
        isVisible?: boolean;
    }

    export interface ElfMap {
        width: number;
        height: number;
        visibleAsteroids?: number;

        [x: number]: {
            [y: number]: MapLocation;
        };
    }

    export function printElfMap(elfMap: ElfMap): string[] {
        const output: string[] = [];
        for (let y = elfMap.height - 1; y >= 0; y--) {
            let line = '';
            for (let x = 0; x < elfMap.width; x++) {
                const position = elfMap[x][y]; // no asteriod = . | invisible asteroid = # | visible asteroid = O
                line += position.isAsteroid ? position.isVisible ? 'O' : '#' : '.';
            }
            console.log(line);
            output.push(line);
        }
        return output;
    }

    export function parseElfMap(lines: string[]): ElfMap {
        if (!lines.length) throw new Error('not enough data supplied');
        const output: ElfMap = {width: lines[0].length, height: lines.length};
        for (let y = lines.length - 1; y >= 0; y--) {
            const line = lines[lines.length - 1 - y];
            if (line.length !== output.width) throw new Error('invalid data supplied');
            for (let x = 0; x < output.width; x++) {
                if (!output[x]) output[x] = {};
                output[x][y] = {isAsteroid: line[x] === '#', x, y};
            }
        }
        return output;
    }

    export function findIdealObservationPost(elfMap: ElfMap): number {
        let highestVisibleAsteroids = 0;
        for (let x = 0; x < elfMap.width; x++) {
            for (let y = 0; y < elfMap.height; y++) {
                if (elfMap[x][y].isAsteroid) {
                    const visibleAsteroids = getVisibleAsteroidCount(elfMap, x, y);
                    if (visibleAsteroids > highestVisibleAsteroids) highestVisibleAsteroids = visibleAsteroids;
                }
            }
        }
        return highestVisibleAsteroids;
    }

    export function getVisibleAsteroidCount(elfMap: ElfMap, asteroidX: number, asteroidY: number): number {
        let visibleAsteroids = 0;
        const baseAsteroid = elfMap[asteroidX][asteroidY];
        for (let x = 0; x < elfMap.width; x++) {
            for (let y = 0; y < elfMap.height; y++) {
                if (x === asteroidX && y === asteroidY) continue;
                const targetAsteroid = elfMap[x][y];
                if (targetAsteroid.isAsteroid) {
                    if (asteroidsHaveLineOfSight(baseAsteroid, targetAsteroid, elfMap)) visibleAsteroids++;
                }
            }
        }
        return visibleAsteroids;
    }

    export function asteroidsHaveLineOfSight(a1: MapLocation, a2: MapLocation, elfMap: ElfMap): boolean {
        const interferingLocations = getInterferingLocations(a1, a2, elfMap);
        return interferingLocations.length === 0;
    }

    export function getInterferingLocations(a1: MapLocation, a2: MapLocation, elfMap: ElfMap): MapLocation[] {
        const output: MapLocation[] = [];
        let stepX: number = 0;
        let stepY: number = 0;
        const deltaX = a2.x - a1.x;
        const deltaY = a2.y - a1.y;
        if (deltaX === 0 && deltaY !== 0) stepY = deltaY > 0 ? 1 : -1;
        else if (deltaY === 0 && deltaX !== 0) stepX = deltaX > 0 ? 1 : -1;
        else {
            const gcd = Math.abs(greatestCommonDivisor(deltaX, deltaY));
            stepX = deltaX / gcd;
            stepY = deltaY / gcd;
        }
        let x = a1.x + stepX;
        let y = a1.y + stepY;
        while (Math.abs(a2.x - x) > 0 || Math.abs(a2.y - y) > 0) {
            if (elfMap[x][y].isAsteroid) output.push(elfMap[x][y]);
            x += stepX;
            y += stepY;
        }

        return output;
    }

    function greatestCommonDivisor(a, b) {
        if (!b) return a;
        return greatestCommonDivisor(b, a % b);
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), '../data/day_10.input'));
        const map = Day10.parseElfMap(lines);
        console.log(Day10.findIdealObservationPost(map));
    }

    main();
}
