import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day08 {
    type Route = {
        actionIndex: number;
        actions: string;
        currentPoint?: Point;
        points: Point[];
    };
    type Point = { id: string; leftId: string; rightId: string; left?: Point; right?: Point };
    function convertLineToPoint(line: string): Point {
        const match = line.match(/^([^\s]+) = \(([^,]+), ([^\)]+)\)/);
        return {
            id: match[1],
            leftId: match[2],
            rightId: match[3],
        };
    }
    function parseRoute(lines: string[]): Route {
        const actions = lines.splice(0, 2)[0];
        const points = lines.map(convertLineToPoint);
        points.forEach((point) => {
            point.left = points.find((x) => x.id === point.leftId);
            point.right = points.find((x) => x.id === point.rightId);
        });
        const actionIndex = 0;
        return { actions, actionIndex, points, currentPoint: points.find((x) => x.id === 'AAA') };
    }

    function followRoute(route: Route, endId = 'ZZZ'): number {
        let steps = 0;
        while (true) {
            if (route.currentPoint.id === endId) break;

            const action = route.actions[route.actionIndex];
            route.actionIndex++;
            if (route.actionIndex >= route.actions.length) route.actionIndex = 0;

            const currentPoint = route.currentPoint;
            if (action === 'L') route.currentPoint = currentPoint.left;
            else route.currentPoint = currentPoint.right;
            steps++;
        }
        return steps;
    }
    export function part1(lines: string[]): number {
        const route = parseRoute([...lines]);
        return followRoute(route);
    }

    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day08.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day08.input'),
            false,
        );

        assert.equal(Y2023_Day08.part1(exampleLines), 2, 'example 1 part 1');
        assert.equal(
            Y2023_Day08.part1(
                `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`.split('\n'),
            ),
            6,
            'example 1 part 1',
        );

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day08.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 20093);

        // part 2
        assert.equal(Y2023_Day08.part2(exampleLines), 0, 'example 1 part 2');

        startMs = Date.now();
        const part2Result = Y2023_Day08.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 0);
    }

    main().catch((err) => console.error(err));
}
