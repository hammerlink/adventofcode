import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';
import { MapEngine, BasicMap, MapLocation } from '../engine/map.engine';

export namespace Y2023_Day10 {
    const Directions = { north: 'north', east: 'east', south: 'south', west: 'west' };
    type Directions = (typeof Directions)[keyof typeof Directions];

    type PipeType = { value: string; directions: Directions[] };
    const pipeTypes: { [pipeType: string]: PipeType } = {
        '.': { value: '.', directions: [] },
        '|': { value: '|', directions: ['north', 'south'] },
        '-': { value: '-', directions: ['east', 'west'] },
        L: { value: 'L', directions: ['north', 'east'] },
        J: { value: 'J', directions: ['north', 'west'] },
        '7': { value: '7', directions: ['south', 'west'] },
        F: { value: 'F', directions: ['south', 'east'] },
        S: { value: 'S', directions: ['north', 'east', 'south', 'west'] },
    };

    export type Pipe = {
        pipeType: PipeType;
        distance?: number;
        connections?: MapLocation<Pipe>[];
        inLoop?: boolean;
        isInnerArea?: boolean;
        next?: MapLocation<Pipe>;
        previous?: MapLocation<Pipe>;
        leftValues: MapLocation<Pipe>[];
        rightValues: MapLocation<Pipe>[];

        // iterate variables
        checkedConnections: MapLocation<Pipe>[];
    };
    export type PipeMap = BasicMap<Pipe> & {
        startPoint?: MapLocation<Pipe>;
        maxDistance: number;
        track?: MapLocation<Pipe>[];
    };

    function getPossibleConnections(pipeLocation: MapLocation<Pipe>, map: PipeMap): MapLocation<Pipe>[] {
        if (!pipeLocation) return [];
        const possiblePoints: MapLocation<Pipe>[] = [];
        const {
            x,
            y,
            value: {
                pipeType: { directions },
            },
        } = pipeLocation;
        if (directions.includes('north')) possiblePoints.push(MapEngine.getPoint(map, x, y - 1));
        if (directions.includes('east')) possiblePoints.push(MapEngine.getPoint(map, x + 1, y));
        if (directions.includes('south')) possiblePoints.push(MapEngine.getPoint(map, x, y + 1));
        if (directions.includes('west')) possiblePoints.push(MapEngine.getPoint(map, x - 1, y));

        return possiblePoints;
    }

    function allDirectAdjacentLocations(pipeLocation: MapLocation<Pipe>, map: PipeMap): MapLocation<Pipe>[] {
        const { x, y } = pipeLocation;
        return [
            MapEngine.getPoint(map, x, y - 1),
            MapEngine.getPoint(map, x + 1, y),
            MapEngine.getPoint(map, x, y + 1),
            MapEngine.getPoint(map, x - 1, y),
        ];
    }

    function buildPipe(map: PipeMap) {
        // set all possible connections
        MapEngine.iterateMap(map, (pipe) => {
            pipe.value.connections = getPossibleConnections(pipe, map);
        });
        // remove all connections that are not in the nearby pipes
        MapEngine.iterateMap(map, (pipe) => {
            pipe.value.connections = pipe.value.connections.filter((connectedPipe) => {
                if (!connectedPipe) return false;
                return connectedPipe.value.connections.includes(pipe);
            });
        });
        console.log('');
        // MapEngine.printMap( map, (pipe) => `${pipe.value.pipeType.value}`, false, false);
        // MapEngine.printMap( map, (pipe) => `${pipe.value.connections?.length}`, false, false);
        let point: MapLocation<Pipe> = map.startPoint;
        point.value.inLoop = true;
        point.value.distance = 0;
        console.log(buildPipeLoop(point, map));
    }
    function buildPipeLoop(startPipe: MapLocation<Pipe>, map: PipeMap): boolean {
        let currentPipe: MapLocation<Pipe> = startPipe;
        let steps = 0;
        let loopFound = false;
        let currentTrack: MapLocation<Pipe>[] = [];
        do {
            steps++;
            const connections = currentPipe.value.connections;
            let hasMoved = false;
            for (let i = 0; i < connections.length; i++) {
                const otherPipe = connections[i];
                if (otherPipe.value.inLoop) continue;
                otherPipe.value.inLoop = true;
                otherPipe.value.distance = steps + 1;
                hasMoved = true;
                currentPipe = otherPipe;
                break;
            }
            if (hasMoved) {
                currentTrack.push(currentPipe);
                continue;
            }

            if (steps > 2 && currentPipe.value.connections.includes(startPipe)) {
                loopFound = true;
                break;
            }
            // GO BACK ONE STEP, check if previous step has other paths
            if (currentTrack.length > 1) {
                const previousPipe = currentTrack[currentTrack.length - 2];
                if (previousPipe.value.connections.length > previousPipe.value.checkedConnections.length) {
                    let last = currentTrack.pop();
                    last.value.inLoop = false;
                    last.value.distance = undefined;
                    steps = steps - 1;
                    currentPipe = previousPipe;
                    // reset step
                    continue;
                }
            }

            return false;
        } while (!loopFound);

        map.maxDistance = currentTrack.length + 1;
        currentTrack.push(startPipe);
        map.track = [startPipe, ...currentTrack];

        return loopFound;
    }
    function buildPipeMap(lines: string[]): PipeMap {
        const map: PipeMap = { ...MapEngine.newMap<Pipe>(), maxDistance: 0 };
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                MapEngine.setPointInMap(map, x, y, {
                    pipeType: pipeTypes[line[x]],
                    checkedConnections: [],
                    leftValues: [],
                    rightValues: [],
                });
                if (line[x] === 'S') {
                    map.startPoint = MapEngine.getPoint(map, x, y);
                }
            }
        }
        return map;
    }

    export function part1(lines: string[]): number {
        const map = buildPipeMap(lines);
        buildPipe(map);
        MapEngine.printMap(map, (pipe) => (pipe.value.distance !== undefined ? 'X' : '.'), false, false);
        return Math.floor((map.maxDistance + 1) / 2);
    }

    function getAdjacentPipe(
        track: MapLocation<Pipe>[],
        currentPipe: MapLocation<Pipe>,
    ): MapLocation<Pipe> | undefined {
        return track.find(
            (pipe) =>
                pipe !== currentPipe &&
                ((currentPipe.x === pipe.x && Math.abs(currentPipe.y - pipe.y) === 1) ||
                    (currentPipe.y === pipe.y && Math.abs(currentPipe.x - pipe.x) === 1)),
        );
    }

    // DIRECTION X:1 Y:0 EAST   LEFT X:0 Y:-1 RIGHT X:0 Y:1
    // DIRECTION X:-1 Y:0 WEST  LEFT X:0 Y:1 RIGHT X:0 Y:-1
    // DIRECTION X:0 Y:1 SOUTH  LEFT X:1 Y:0 RIGHT X:-1 Y:0
    // DIRECTION X:0 Y:-1 NORTH LEFT X:-1 Y:0 RIGHT X:1 Y:0
    function getLeftRight(direction: Direction): { left: Direction; right: Direction } {
        // EAST
        if (direction.x === 1) return { left: { x: 0, y: -1 }, right: { x: 0, y: 1 } };
        // WEST
        if (direction.x === -1) return { left: { x: 0, y: 1 }, right: { x: 0, y: -1 } };
        // SOUTH
        if (direction.y === 1) return { left: { x: 1, y: 0 }, right: { x: -1, y: 0 } };
        // NORTH
        if (direction.y === -1) return { left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
        throw new Error(`invalid direction ${JSON.stringify(direction)}`);
    }
    type Direction = { x: number; y: number };

    function calculateInnerIsLeft(map: PipeMap): boolean {
        let yBase = 0;
        for (let y = map.minY; y <= map.maxY; y++) {
            const point = MapEngine.getPoint(map, 0, y);
            if (!point.value.inLoop) {
                yBase = y;
                let hasField = false;
                for (let x = 0; x <= map.maxX; x++) {
                    if (MapEngine.getPoint(map, x, yBase).value.inLoop) {
                        hasField = true;
                        break;
                    }
                }
                if (hasField) break;
            }
        }
        let previous: MapLocation<Pipe>;
        for (let x = 0; x <= map.maxX; x++) {
            const point = MapEngine.getPoint(map, x, yBase);
            if (point.value.inLoop) {
                if (!previous) throw new Error('entry is on border');
                if (point.value.leftValues.includes(previous)) return false;
                if (point.value.rightValues.includes(previous)) return true;
                throw new Error('not found in values');
            }
            previous = point;
        }
        throw new Error('missing');
    }

    function followTrack(map: PipeMap) {
        let previousDirection: Direction = { x: 0, y: 0 };
        let previousPipe: MapLocation<Pipe> = map.track[0];
        map.track?.forEach((pipe, i) => {
            if (i === 0) return;
            const direction = { x: pipe.x - previousPipe.x, y: pipe.y - previousPipe.y };
            // determine left & right
            const { left, right } = getLeftRight(direction);
            const leftPoint = MapEngine.getPoint(map, pipe.x + left.x, pipe.y + left.y);
            if (leftPoint) pipe.value.leftValues.push(leftPoint);
            const rightPoint = MapEngine.getPoint(map, pipe.x + right.x, pipe.y + right.y);
            if (rightPoint) pipe.value.rightValues.push(rightPoint);

            if (direction.x !== previousDirection.x || direction.y !== previousDirection.y) {
                // add the current direction to the previous point

                const leftPoint = MapEngine.getPoint(map, previousPipe.x + left.x, previousPipe.y + left.y);
                if (leftPoint) previousPipe.value.leftValues.push(leftPoint);
                const rightPoint = MapEngine.getPoint(map, previousPipe.x + right.x, previousPipe.y + right.y);
                if (rightPoint) previousPipe.value.rightValues.push(rightPoint);
            }

            previousPipe = pipe;
            previousDirection = direction;
        });
        const isInnerLeft = calculateInnerIsLeft(map);
        console.log('is inner left', isInnerLeft);

        // console.log('print left & right borders');
        // MapEngine.printMap(map, pipe => {
        //     const adjacent = allDirectAdjacentLocations(pipe, map);
        //     const adjacentToPipe = adjacent.find(x => x?.value.rightValues.includes(pipe) || x?.value.leftValues.includes(pipe));
        //     if (adjacentToPipe) return 'A';
        //     return pipe.value.inLoop ? 'X' : '.';
        // });
        // console.log('END print left & right borders');

        let areaTrack: MapLocation<Pipe>[] = [];
        let foundAreas: { startIndex: number; endIndex: number }[] = [];
        map.track?.forEach((pipe) => {
            areaTrack.push(pipe);
            const previousAdjacent = getAdjacentPipe(areaTrack, pipe);
            if (previousAdjacent === undefined) return;
            const startIndex = areaTrack.indexOf(previousAdjacent);
            if (startIndex === areaTrack.length - 2) return;
            const endIndex = areaTrack.length - 1;
            const innerArea = foundAreas.find((x) => startIndex <= x.startIndex && x.endIndex <= endIndex);
            if (innerArea) return;
            // todo
            console.log('pipe touch', startIndex, endIndex);
            const areaLine = areaTrack.slice(startIndex);
            foundAreas.push({ startIndex, endIndex });
            // 104 107
            if (startIndex === 104 && endIndex === 107) {
                const x = null;
            }
            const includedValues = isInnerLeft ? previousAdjacent.value.leftValues : previousAdjacent.value.rightValues;
            if (includedValues.includes(pipe)) fillArea(map, areaLine, isInnerLeft);
        });
    }
    function fillArea(map: PipeMap, areaLine: MapLocation<Pipe>[], isInnerLeft: boolean) {
        if (!areaLine.length) throw new Error('invalid area line');
        // upon each corner check if it is in the line
        let previous = areaLine[1];
        let direction = { x: areaLine[1].x - areaLine[0].x, y: areaLine[1].y - areaLine[0].y };
        const innerArea: MapLocation<Pipe>[] = [];
        for (let i = 1; i < areaLine.length - 1; i++) {
            let next = areaLine[i];
            let nextDirection = { x: next.x - previous.x, y: next.y - previous.y };
            (isInnerLeft ? next.value.leftValues : next.value.rightValues)
                .filter((x) => !x.value.inLoop)
                .forEach((x) => innerArea.push(x));
            // if (nextDirection.x !== direction.x || nextDirection.y !== direction.y) {
            //     const { x, y } =
            //         nextDirection.x !== direction.x ? { x: 0, y: -direction.y } : { x: -direction.x, y: 0 };
            //
            //     let possibleX = next.x + x;
            //     let possibleY = next.y + y;
            //     const possibleLocation = MapEngine.getPoint(map, possibleX, possibleY);
            //     if (possibleLocation && !areaLine.includes(possibleLocation)) {
            //         let hasParallelLine = false;
            //         let nextPoint = possibleLocation;
            //         while (true) {
            //             possibleX += x;
            //             possibleY += y;
            //             nextPoint = MapEngine.getPoint(map, possibleX, possibleY);
            //             if (!nextPoint) break;
            //             if (areaLine.includes(nextPoint)) {
            //                 hasParallelLine = true;
            //                 break;
            //             }
            //         }
            //         // check if there is a parallel line in the same direction
            //         if (hasParallelLine) innerArea.push(possibleLocation);
            //     }
            // }
            direction = nextDirection;
            previous = next;
        }
        // fill up all extra locations to the innerArea
        let extraCount = 0;
        do {
            extraCount = 0;
            innerArea.forEach((pipe) => {
                const adjacentPipes = allDirectAdjacentLocations(pipe, map);
                adjacentPipes
                    .filter((x) => !!x && !areaLine.includes(x) && !innerArea.includes(x))
                    .forEach((pipe) => {
                        extraCount++;
                        innerArea.push(pipe);
                    });
            });
        } while (extraCount > 0);
        innerArea.forEach((pipe) => {
            if (pipe.value.pipeType.value === '.') pipe.value.isInnerArea = true;
        });
        MapEngine.printMap(
            map,
            (pipe) => {
                if (innerArea.includes(pipe)) return 'I';
                if (areaLine.includes(pipe)) return `${areaLine.indexOf(pipe)}`;
                return pipe?.value.pipeType.value;
            },
            false,
            false,
        );
    }

    export function part2(lines: string[]): number {
        const map = buildPipeMap(lines);
        buildPipe(map);
        followTrack(map);
        let counter = 0;
        MapEngine.iterateMap(map, (pipe) => {
            if (pipe.value.isInnerArea) counter++;
        });
        // fill up map while drawing the line
        // follow the line & check when the lines are next to another line fill up the area
        // follow line & assign all left & right fields, go from x0, startY towards start point, first line encounter determines whether its left or right
        return counter;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day10.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day10.input'),
            false,
        );

        assert.equal(Y2023_Day10.part1(exampleLines), 4, 'example part 1');

        // part 1
        let startMs = Date.now();
        // const part1Result = Y2023_Day10.part1(lines);
        // console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        // assert.equal(part1Result, 6613);

        // part 2
        assert.equal(
            Y2023_Day10.part2(
                `..........
.S------7.
.|F----7|.
.||....||.
.||....||.
.|L-7F-J|.
.|..||..|.
.L--JL--J.
..........`.split('\n'),
            ),
            4,
            'example part 2',
        );

        assert.equal(
            Y2023_Day10.part2(
                `.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...`.split('\n'),
            ),
            8,
            'example part 2',
        );

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day10.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 0);
    }

    main().catch((err) => console.error(err));
}
