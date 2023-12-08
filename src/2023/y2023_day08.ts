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
    function followGhostRoute(route: Route): number {
        let steps = 0;
        const ghostPoints = route.points.filter((x) => x.id.match(/A$/));
        const recurringMap: {
            map: {
                [id: string]: {
                    steps: number[];
                    recurringStepJump?: number;
                };
            };
            hasRecurring?: boolean;
            recurringStart?: number;
            jump?: number;
        }[] = ghostPoints.map((_) => ({ map: {} }));
        while (true) {
            let count = 0;
            ghostPoints.forEach((x, index) => {
                if (x.id[2] !== 'Z') return;
                count++;
                const recurringTrack = recurringMap[index];
                if (!recurringTrack.map[x.id]) recurringTrack.map[x.id] = { steps: [] };
                const trackSteps = recurringTrack.map[x.id].steps;
                trackSteps.push(steps);
                if (trackSteps.length < 4) return;
                const last = trackSteps[trackSteps.length - 1];
                const secondLast = trackSteps[trackSteps.length - 2];
                const lastDelta = last - secondLast;
                // already mapped
                if (lastDelta === recurringTrack.map[x.id].recurringStepJump) return;

                const thirdLast = trackSteps[trackSteps.length - 3];
                const secondLastDelta = secondLast - thirdLast;
                if (lastDelta !== secondLastDelta) return;

                const fourthLast = trackSteps[trackSteps.length - 4];
                const thirdLastDelta = thirdLast - fourthLast;
                if (thirdLastDelta !== lastDelta) return;

                recurringTrack.map[x.id].recurringStepJump = lastDelta;
                console.log('found recurring', index, x.id, lastDelta, steps);
                recurringTrack.hasRecurring = true;
                recurringTrack.recurringStart = steps;
                recurringTrack.jump = lastDelta;
            });
            // if (count > 2) console.log(steps, count, JSON.stringify(ghostPoints.map((x) => x.id)));
            if (count === ghostPoints.length || recurringMap.every((x) => x.hasRecurring)) break;

            const action = route.actions[route.actionIndex];
            route.actionIndex++;
            if (route.actionIndex >= route.actions.length) route.actionIndex = 0;

            for (let i = 0; i < ghostPoints.length; i++) {
                const currentPoint = ghostPoints[i];
                ghostPoints[i] = action === 'L' ? currentPoint.left : currentPoint.right;
            }
            steps++;
        }
        if (ghostPoints.every((x) => x.id[2] === 'Z')) return steps;
        recurringMap.sort((a, b) => b.jump - a.jump);
        const jump = recurringMap[0].jump;
        let index = 1;
        while (true) {
            const steps = recurringMap[0].recurringStart + jump * index;
            let isMatch = true;
            for (let i = 1; i < recurringMap.length; i++) {
                const track = recurringMap[i];
                if ((steps - track.recurringStart) % track.jump !== 0) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return steps;
            index++;
        }
    }

    export function part2(lines: string[]): number {
        const route = parseRoute([...lines]);
        return followGhostRoute(route);
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
        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day08.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 22103062509257);
    }

    main().catch((err) => console.error(err));
}
