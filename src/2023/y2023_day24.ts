import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day24 {
    type Location = {
        x: number;
        y: number;
        z: number;
    };
    export type BaseHailStone = {
        position: Location;
        direction: Location;
        parameters2d: Parameters2D | null;
    };
    export type HailStone = BaseHailStone & {
        x0: Location;
        x0Timing: number;
        y0: Location;
        y0Timing: number;
        z0: Location;
        z0Timing: number;
    };
    type Intersection2D = {
        x: number;
        y: number;
        durationA: number;
        durationB: number;
        a: BaseHailStone;
        b: BaseHailStone;
    };
    type Parameters2D = { a: number; b: number };
    type RockHailStone = HailStone & { duration: number; index: number };
    type Rock = {
        position: Location;
        direction: Location;
        parameters2d: Parameters2D | null;
        hailStoneCollisions: RockHailStone[];
        timeNs: number;
    };

    function getNextCollision(
        rock: BaseHailStone,
        hailStone: BaseHailStone,
        duration: number,
    ): { position: Location; duration: number } | null {
        const intersection = get2DIntersection(rock, hailStone);
        if (
            intersection === null ||
            intersection.durationA < duration ||
            intersection.durationA !== intersection.durationB ||
            Math.round(intersection.durationA) !== intersection.durationA
        )
            return null;
        const rockPosition = applyDuration(rock, intersection.durationA);
        const hailStonePosition = applyDuration(hailStone, intersection.durationB);
        if (
            rockPosition.x !== hailStonePosition.x ||
            rockPosition.y !== hailStonePosition.y ||
            rockPosition.z !== hailStonePosition.z
        )
            return null;
        return { duration: intersection.durationA, position: rockPosition };
    }

    export function parseHailStone(line: string): HailStone {
        const pieces = line.split(' @ ').map((x) => x.trim());
        assert.equal(pieces.length, 2);
        const positionParts = pieces[0].split(', ').map((x) => parseInt(x));
        const directionParts = pieces[1].split(', ').map((x) => parseInt(x));
        const position: Location = {
            x: positionParts[0],
            y: positionParts[1],
            z: positionParts[2],
        };
        const direction: Location = {
            x: directionParts[0],
            y: directionParts[1],
            z: directionParts[2],
        };
        const baseHailStone = { position, direction };
        const x0 = getDurationToReachZero(position.x, direction.x, baseHailStone);
        const y0 = getDurationToReachZero(position.y, direction.y, baseHailStone);
        const z0 = getDurationToReachZero(position.z, direction.z, baseHailStone);
        return {
            position,
            direction,
            x0: x0.location,
            x0Timing: x0.duration,
            y0: y0.location,
            y0Timing: y0.duration,
            z0: z0.location,
            z0Timing: z0.duration,
            parameters2d: get2DParameters(baseHailStone),
        };
    }
    function get2DParameters(hailStone: { position: Location; direction: Location }): Parameters2D | null {
        const x0Location = getDurationToReachZero(hailStone.position.x, hailStone.direction.x, hailStone);
        const y0Location = getDurationToReachZero(hailStone.position.y, hailStone.direction.y, hailStone);
        if (y0Location.location.x === 0) return null;

        const b = x0Location.location.y;
        const a = -b / y0Location.location.x;

        return { a, b };
    }
    export function applyDuration(hailStone: { position: Location; direction: Location }, duration: number): Location {
        const x = hailStone.position.x + hailStone.direction.x * duration;
        const y = hailStone.position.y + hailStone.direction.y * duration;
        const z = hailStone.position.z + hailStone.direction.z * duration;
        return { x, y, z };
    }
    function getDurationToReachZero(
        position: number,
        velocity: number,
        hailStone: { position: Location; direction: Location },
    ): { location: Location; duration: number } | null {
        if (velocity === 0) return null;
        const duration = -position / velocity;
        return { duration, location: applyDuration(hailStone, duration) };
    }
    function get2DIntersection(hailStone: BaseHailStone, otherHailStone: BaseHailStone): Intersection2D | null {
        const {
            parameters2d: { a: a1, b: b1 },
        } = hailStone;
        const {
            parameters2d: { a: a2, b: b2 },
        } = otherHailStone;
        // a1 * x + b1 = a2 * x + b2
        // console.log(`a1: ${a1} b1: ${b1} a2: ${a2} b2: ${b2}`);
        const divider = a1 - a2;
        if (divider === 0) return null;
        const x = (b2 - b1) / divider;
        const y = a1 * x + b1;
        const durationA = smartRound((x - hailStone.position.x) / hailStone.direction.x);
        const durationB = smartRound((x - otherHailStone.position.x) / otherHailStone.direction.x);
        return { x, y, durationA, durationB, a: hailStone, b: otherHailStone };
    }
    function getAllIntersections(hailStones: HailStone[]): Intersection2D[] {
        const output = [];
        for (let i = 0; i < hailStones.length; i++) {
            const hailStone = hailStones[i];
            for (let j = i + 1; j < hailStones.length; j++) {
                const otherHailStone = hailStones[j];
                const intersection = get2DIntersection(hailStone, otherHailStone);
                if (intersection) output.push(intersection);
            }
        }
        return output;
    }
    export function smartRound(input: number, precision = 5, tolerance = 0.000001) {
        const factor = Math.pow(10, precision);
        const roundedNumber = Math.round(input * factor) / factor;
        const difference = Math.abs(input - roundedNumber);

        if (difference <= tolerance) {
            return Number(roundedNumber.toFixed(precision));
        } else {
            return input; // Return the original number if not within tolerance
        }
    }
    export function part1(lines: string[], min: number, max: number): number {
        const hailStones = lines.map(parseHailStone);
        const result = getAllIntersections(hailStones);
        const filtered = result.filter(({ x, y, durationA, durationB }) => {
            if (durationA < 0 || durationB < 0) return false;
            return x >= min && x <= max && y >= min && y <= max;
        });
        return filtered.length;
    }
    function findRockPath(rock: Rock, hailStones: HailStone[]): Rock | null {
        if (rock.hailStoneCollisions.length === hailStones.length) return rock;
        const currentTimeNs = rock.timeNs;
        // const position = rock.position;
        for (let i = 0; i < hailStones.length; i++) {
            const hailStone = hailStones[i];
            if (rock.hailStoneCollisions.some((x) => x.index === i)) continue;
            const collission = getNextCollision(rock, hailStone, rock.timeNs);
            if (collission === null) continue;
            rock.timeNs = collission.duration;
            // rock.position = collission.position;
            rock.hailStoneCollisions.push({ ...hailStone, index: i, duration: collission.duration });

            const result = findRockPath(rock, hailStones);
            if (result !== null) return result;

            // reset
            rock.timeNs = currentTimeNs;
            // rock.position = position;
            rock.hailStoneCollisions.pop();
        }
        return null;
    }
    function tryRockPath(
        hailStone: RockHailStone,
        otherHailStone: RockHailStone,
        counter: number,
        hailStones: HailStone[],
    ): Rock | null {
        const position = applyDuration(hailStone, 1);
        const nextPosition = applyDuration(otherHailStone, counter + 1);
        const direction: Location = {
            x: (nextPosition.x - position.x) / counter,
            y: (nextPosition.y - position.y) / counter,
            z: (nextPosition.z - position.z) / counter,
        };
        const basePosition = applyDuration({ position, direction }, -1);
        const rawRock: Rock = {
            hailStoneCollisions: [
                { ...hailStone, duration: 1 },
                { ...otherHailStone, duration: 1 + counter },
            ],
            position: basePosition,
            direction,
            timeNs: 1 + counter,
            parameters2d: get2DParameters({ position: basePosition, direction }),
        };
        for (let i = 0; i < hailStones.length; i++) {
            if (i === hailStone.index || i === otherHailStone.index) continue;
            if (!getNextCollision(rawRock, hailStones[i], counter + 1)) return null;
        }
        return findRockPath(rawRock, hailStones);
    }
    function tryAllRockPaths(hailStones: HailStone[]): Rock {
        let counter = 1;
        // real test cna start at 135
        while (true) {
            if (counter === 3) counter = 500; // skip already done checks
            if (counter % 100 === 0) console.log('counter', counter);
            // todo reduce the amount of paths to check
            // => check how many are in the correct direction
            for (let i = 0; i < hailStones.length; i++) {
                const hailStone = hailStones[i];
                for (let j = i + 1; j < hailStones.length; j++) {
                    const otherHailStone = hailStones[j];
                    const firstRock = tryRockPath(
                        { ...hailStone, index: i, duration: 0 },
                        { ...otherHailStone, index: j, duration: 0 },
                        counter,
                        hailStones,
                    );
                    if (firstRock !== null) return firstRock;
                    const secondRock = tryRockPath(
                        { ...otherHailStone, index: j, duration: 0 },
                        { ...hailStone, index: i, duration: 0 },
                        counter,
                        hailStones,
                    );
                    if (secondRock !== null) return secondRock;
                }
            }
            counter++;
        }
    }
    export function part2(lines: string[]): number {
        const hailStones = lines.map(parseHailStone);
        const {
            position: { x, y, z },
        } = tryAllRockPaths(hailStones);
        return x + y + z;
    }
}

const MIN = 200000000000000;
const MAX = 400000000000000;
if (!module.parent) {
    const path = require('path');

    const main = async () => {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day24.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day24.input'),
            false,
        );

        console.log('part 1 example start');
        assert.equal(Y2023_Day24.part1(exampleLines, 7, 27), 2, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day24.part1(lines, MIN, MAX);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 28266);
        // part 2
        assert.equal(Y2023_Day24.part2(exampleLines), 47, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day24.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    };

    main().catch((err) => console.error(err));
}
