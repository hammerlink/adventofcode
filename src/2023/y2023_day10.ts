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

        // iterate variables
        checkedConnections: MapLocation<Pipe>[];
    };
    export type PipeMap = BasicMap<Pipe> & {
        startPoint?: MapLocation<Pipe>;
        maxDistance: number;
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
                    steps = steps -1;
                    currentPipe = previousPipe;
                    // reset step
                    continue;
                }
            }

            return false;
            // // RESET ALL
            // currentTrack.forEach((pipe) => {
            //     pipe.value.inLoop = false;
            //     pipe.value.distance = undefined;
            // });
            // currentTrack = [];
            // steps
        } while (!loopFound);

        map.maxDistance = currentTrack.length + 1;
    
        return loopFound;
    }
    function buildPipeLoopOld(pipe: MapLocation<Pipe>, map: PipeMap, steps: number): boolean {
        const connections = pipe.value.connections;
        for (let i = 0; i < connections.length; i++) {
            const otherPipe = connections[i];
            if (steps > 2 && otherPipe.value.pipeType.value === 'S') return true;
            if (otherPipe.value.inLoop) continue;
            otherPipe.value.inLoop = true;
            otherPipe.value.distance = steps + 1;

            const isInLoop = buildPipeLoop(otherPipe, map);
            if (isInLoop) {
                if (!map.maxDistance || steps + 1 > map.maxDistance) map.maxDistance = steps + 1;
                return true;
            }

            otherPipe.value.distance = undefined;
            otherPipe.value.inLoop = false;
        }
        return false;
    }

    function buildPipeMap(lines: string[]): PipeMap {
        const map: PipeMap = { ...MapEngine.newMap<Pipe>(), maxDistance: 0 };
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                MapEngine.setPointInMap(map, x, y, {
                    pipeType: pipeTypes[line[x]],
                    checkedConnections: [],
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
        return Math.floor((map.maxDistance + 1) / 2);
    }

    export function part2(lines: string[]): number {
        return 0;
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
        const part1Result = Y2023_Day10.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        // assert.equal(part1Result, 1681758908);

        // part 2
        assert.equal(Y2023_Day10.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day10.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 0);
    }

    main().catch((err) => console.error(err));
}
