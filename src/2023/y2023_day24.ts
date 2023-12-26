import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day24 {
    type HailStone = {
        position: {
            x: number;
            y: number;
            z: number;
        };
        direction: {
            x: number;
            y: number;
            z: number;
        };
    };
    type Intersection2D = {
        x: number;
        y: number;
        durationA: number;
        durationB: number;
        a: HailStone;
        b: HailStone;
    };
    function parseHailStone(line: string): HailStone {
        const pieces = line.split(' @ ').map((x) => x.trim());
        assert.equal(pieces.length, 2);
        const positionParts = pieces[0].split(', ').map((x) => parseInt(x));
        const directionParts = pieces[1].split(', ').map((x) => parseInt(x));
        return {
            position: {
                x: positionParts[0],
                y: positionParts[1],
                z: positionParts[2],
            },
            direction: {
                x: directionParts[0],
                y: directionParts[1],
                z: directionParts[2],
            },
        };
    }
    function get2DParameters(hailStone: HailStone): { a: number; b: number } | null {
        // calculate hitting the axis
        // y - axis , target x = 0
        const baseX = hailStone.position.x;
        const velocityX = hailStone.direction.x;
        // baseX = velocityX * DURATION
        const backToX = -baseX / velocityX;
        const yOnXAxis = hailStone.position.y + backToX * hailStone.direction.y;

        // x - axis
        const baseY = hailStone.position.y;
        const velocityY = hailStone.direction.y;
        const backToY = -baseY / velocityY;
        const xOnYAxis = hailStone.position.x + backToY * hailStone.direction.x;
        if (xOnYAxis === 0) return null;

        const b = yOnXAxis;
        const a = -yOnXAxis / xOnYAxis;

        return { a, b };
    }
    function get2DIntersection(hailStone: HailStone, otherHailStone: HailStone): Intersection2D | null {
        const { a: a1, b: b1 } = get2DParameters(hailStone);
        const { a: a2, b: b2 } = get2DParameters(otherHailStone);
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
    export function part1(lines: string[], min: number, max: number): number {
        const hailStones = lines.map(parseHailStone);
        const result = getAllIntersections(hailStones);
        const filtered = result.filter(({ x, y, durationA, durationB }) => {
            if (durationA < 0 || durationB < 0) return false;
            return x >= min && x <= max && y >= min && y <= max;
        });
        return filtered.length;
    }
    export function part2(lines: string[]): number {
        return 0;
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
        assert.equal(Y2023_Day24.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day24.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    };

    main().catch((err) => console.error(err));
}
