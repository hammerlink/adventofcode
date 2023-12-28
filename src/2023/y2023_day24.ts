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
    };
    export type HailStone = BaseHailStone & {
        x0: Location;
        x0Timing: number;
        y0: Location;
        y0Timing: number;
        z0: Location;
        z0Timing: number;
        parameters2d: Parameters2D | null;
        parameters3d: Parameters3D | null;
    };
    type Intersection2D = {
        x: number;
        y: number;
        durationA: number;
        durationB: number;
        a: HailStone;
        b: HailStone;
    };
    type Parameters2D = { a: number; b: number };
    type Parameters3D = { a: number; b: number; c: number };
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
            parameters3d: get3DParameters({ ...baseHailStone, x0: x0.location, y0: y0.location }),
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
    export function applyFormulaDuration(hailStone: HailStone, duration: number): Location {
        const x = hailStone.position.x + hailStone.direction.x * duration;
        const y = hailStone.position.y + hailStone.direction.y * duration;
        const z = hailStone.position.z + hailStone.direction.z * duration;
        const formulaZ = x * hailStone.parameters3d.a + y * hailStone.parameters3d.b + hailStone.parameters3d.c;
        assert.equal(formulaZ, z);
        return { x, y, z };
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
    function get3DParameters({
        direction,
        x0,
        y0,
    }: {
        position: Location;
        direction: Location;
        x0: Location;
        y0: Location;
    }): Parameters3D | null {
        const bDivider = -direction.y / direction.x + x0.y;
        const b = (x0.z - y0.z + direction.z / direction.x) / bDivider;
        const a = (b * direction.y - direction.z) / -direction.x;
        const c = -a * y0.x - y0.z;

        // TODO ADD A BACKUP FAILURE FOR WHEN b is null
        return { a, b, c };
    }
    function get2DIntersection(hailStone: HailStone, otherHailStone: HailStone): Intersection2D | null {
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
        const durationA = (x - hailStone.position.x) / hailStone.direction.x;
        const durationB = (x - otherHailStone.position.x) / otherHailStone.direction.x;
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
        console.log(
            'hailstone counts',
            hailStones.filter((x) => typeof x.parameters2d?.a !== 'number').length,
            hailStones.filter((x) => typeof x.parameters3d?.a !== 'number').length,
        );
        const result = getAllIntersections(hailStones);
        const filtered = result.filter(({ x, y, durationA, durationB }) => {
            if (durationA < 0 || durationB < 0) return false;
            return x >= min && x <= max && y >= min && y <= max;
        });
        return filtered.length;
    }
    export function part2(lines: string[]): number {
        const hailStones = lines.map(parseHailStone);
        hailStones.forEach((hailStone) => {
            const { a, b, c } = get3DParameters(hailStone);
            console.log(JSON.stringify(hailStone));
            console.log(JSON.stringify({ a, b, c }));
            console.log();
        });
        // for (let i = 0; i < hailStones.length; i++) {
        //     const hailStone = hailStones[i];
        //     for (let j = i + 1; j < hailStones.length; j++) {
        //         const otherHailStone = hailStones[j];
        //         const intersection = get3DIntersection(hailStone, otherHailStone);
        //         if (intersection) output.push(intersection);
        //     }
        // }
        return 0;
    }
}

const MIN = 200000000000000;
const MAX = 400000000000000;
if (!module.parent) {
    const path = require('path');

    const main = async () => {
        // UNIT TESTS
        assert.equal(Y2023_Day24.smartRound(0.005500001), 0.0055);
        assert.equal(Y2023_Day24.smartRound(1.000000001), 1);
        assert.equal(Y2023_Day24.smartRound(2.8333333333333335), 2.8333333333333335);
        // const exampleBaseHailStone1: Y2023_Day24.BaseHailStone = {
        //     position: { x: 19, y: 13, z: 30 },
        //     direction: { x: -2, y: 1, z: -2 },
        // };
        const exampleHailStone1 = Y2023_Day24.parseHailStone('19, 13, 30 @ -2,  1, -2');
        assert.equal(exampleHailStone1.parameters3d.b, 85 / 30);
        assert.equal(exampleHailStone1.parameters3d.c, -52.75);
        // TODO VERIFY THE A, B, C
        Y2023_Day24.applyFormulaDuration(exampleHailStone1, 1);
        Y2023_Day24.applyFormulaDuration(exampleHailStone1, 2);

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
        assert.equal(Y2023_Day24.part2(exampleLines), 0, 'example part 2');

        // startMs = Date.now();
        // console.log('part 2 start');
        // const part2Result = Y2023_Day24.part2(lines);
        // console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 0);
    };

    main().catch((err) => console.error(err));
}
