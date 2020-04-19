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

    export function findIdealObservationPost(elfMap: ElfMap): { visibleAsteroids: number, location: MapLocation } {
        let highestVisibleAsteroids = 0;
        let mapLocation: MapLocation = null;
        for (let x = 0; x < elfMap.width; x++) {
            for (let y = 0; y < elfMap.height; y++) {
                if (elfMap[x][y].isAsteroid) {
                    const visibleAsteroids = getVisibleAsteroidCount(elfMap, x, y);
                    if (visibleAsteroids > highestVisibleAsteroids) {
                        highestVisibleAsteroids = visibleAsteroids;
                        mapLocation = elfMap[x][y];
                    }
                }
            }
        }
        return {visibleAsteroids: highestVisibleAsteroids, location: mapLocation};
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

    export function calculateAngleAndDistance(observationPoint: MapLocation, targetLocation: MapLocation): { angle: number, distance: number } {
        // observation point is relative 0,0
        const x = targetLocation.x - observationPoint.x;
        const y = targetLocation.y - observationPoint.y;
        const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let angle: number = 0;
        if (x > 0 && y >= 0) {
            angle = y === 0 ? Math.PI / 2 : Math.atan(x / y);
        } else if (x >= 0 && y < 0) {
            angle = x === 0 ? Math.PI : Math.PI / 2 + Math.atan(Math.abs(y / x));
        } else if (x < 0 && y <= 0) {
            angle = y === 0 ? Math.PI * 3 / 2 : Math.PI + Math.atan(Math.abs(x / y));
        } else if (x < 0 && y > 0) {
            angle = Math.PI * 3 / 2 + Math.atan(Math.abs(y / x));
        }
        angle = parseFloat(angle.toFixed(6));
        return {angle, distance};
    }

    export interface LaserTarget {angle: number; asteroids: Array<{distance: number, mapLocation: MapLocation}>}
    export function prepareLaserTargets(elfMap: ElfMap, observationPoint: MapLocation): LaserTarget[] {
        const output: LaserTarget[] = [];
        const angleMap: {[angle: number]: LaserTarget} = {};
        for (let x = 0; x < elfMap.width; x++) {
            for (let y = 0; y < elfMap.height; y++) {
                const targetLocation = elfMap[x][y]
                if (targetLocation.isAsteroid && targetLocation !== observationPoint) {
                    const metrics = calculateAngleAndDistance(observationPoint, targetLocation);
                    if (!angleMap[metrics.angle]) angleMap[metrics.angle] = {angle: metrics.angle, asteroids: []};
                    angleMap[metrics.angle].asteroids.push({distance: metrics.distance, mapLocation: targetLocation});
                }
            }
        }
        // sort on angle & distance
        Object.keys(angleMap).sort(((a, b) => parseFloat(a) - parseFloat(b))).forEach(angleKey => {
            const laserTarget: LaserTarget = angleMap[angleKey];
            laserTarget.asteroids.sort(((a, b) => a.distance - b.distance));
            output.push(laserTarget);
        });
        return output;
    }

    export function executeLaserOnMap(elfMap: ElfMap, shots: number): number {
        const observationPoint = findIdealObservationPost(elfMap).location;
        const laserTargets = prepareLaserTargets(elfMap, observationPoint);
        let latestTarget: MapLocation;
        let currentIndex = 0;
        let currentShot = 0;
        function increaseIndex() {
            currentIndex++;
            if (currentIndex > laserTargets.length - 1) currentIndex =  0;
        }
        while(currentShot < shots) {
            let startIndex = currentIndex;
            let hasStartedLoop = false;
            let nextLaserTarget: {distance: number, mapLocation: MapLocation} = null;
            while (nextLaserTarget === null && (currentIndex !== startIndex || !hasStartedLoop)) {
                hasStartedLoop = true;
                if (laserTargets[currentIndex].asteroids.length) {
                    nextLaserTarget = laserTargets[currentIndex].asteroids.shift();
                    nextLaserTarget.mapLocation.isAsteroid = false; // PEW PEW
                    currentShot++;
                    latestTarget = nextLaserTarget.mapLocation;
                }
                increaseIndex();
            }
        }

        return latestTarget.x * 100 + (elfMap.height - 1 - latestTarget.y);
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), '../data/day_10.input'));
        const map = Day10.parseElfMap(lines);
        console.log(Day10.findIdealObservationPost(map));

        console.log('part 2', Day10.executeLaserOnMap(map, 200));
    }

    main().catch(err => console.error(err));
}
