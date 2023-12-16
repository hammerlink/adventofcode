import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';
import { BasicMap, MapEngine, MapLocation } from '../engine/map.engine';

export namespace Y2023_Day16 {
    type Mirror = {
        value: string;
        isEnergized?: boolean;
        entries: Directions[];
    };
    type MirrorMap = BasicMap<Mirror>;
    const Directions = { north: 'north', east: 'east', south: 'south', west: 'west' };
    type Directions = (typeof Directions)[keyof typeof Directions];
    const directionMap: { [direction: string]: { x: number; y: number } } = {
        north: { x: 0, y: -1 },
        east: { x: 1, y: 0 },
        south: { x: 0, y: 1 },
        west: { x: -1, y: 0 },
    };
    type Beam = {
        location: MapLocation<Mirror>;
        direction: Directions;
        isFinished?: boolean;
    };
    function getNextStepInDirection(
        location: MapLocation<Mirror>,
        map: MirrorMap,
        direction: Directions,
    ): MapLocation<Mirror> | undefined {
        const { x: xDelta, y: yDelta } = directionMap[direction];
        return MapEngine.getPoint(map, location.x + xDelta, location.y + yDelta);
    }
    function executeBeamStep(
        mirrorMap: MirrorMap,
        beam: Beam,
        sameLocation = false,
    ): { newBeams: Beam[]; hasEnergized: boolean } {
        const direction = beam.direction;
        const nextLocation = sameLocation ? beam.location : getNextStepInDirection(beam.location, mirrorMap, direction);
        let hasEnergized = false;
        if (!nextLocation || nextLocation.value.entries.includes(direction))
            return { newBeams: [], hasEnergized: false };
        if (!nextLocation.value.isEnergized) {
            hasEnergized = true;
        }
        nextLocation.value.isEnergized = true;
        nextLocation.value.entries.push(direction);
        const { value } = nextLocation.value;
        beam.location = nextLocation;
        if (value === '/') {
            if (direction === 'south') beam.direction = 'west';
            else if (direction === 'north') beam.direction = 'east';
            else if (direction === 'east') beam.direction = 'north';
            else if (direction === 'west') beam.direction = 'south';
            return { newBeams: [beam], hasEnergized };
        }
        if (value === '\\') {
            if (direction === 'south') beam.direction = 'east';
            else if (direction === 'north') beam.direction = 'west';
            else if (direction === 'east') beam.direction = 'south';
            else if (direction === 'west') beam.direction = 'north';
            return { newBeams: [beam], hasEnergized };
        }
        if (value === '|') {
            if (direction === 'east' || direction === 'west') {
                return {
                    newBeams: [
                        { ...beam, direction: 'north' },
                        { ...beam, direction: 'south' },
                    ],
                    hasEnergized,
                };
            }
        }
        if (value === '-') {
            if (direction === 'north' || direction === 'south') {
                return {
                    newBeams: [
                        { ...beam, direction: 'east' },
                        { ...beam, direction: 'west' },
                    ],
                    hasEnergized,
                };
            }
        }
        return { newBeams: [beam], hasEnergized };
    }
    function executeBeam(mirrorMap: MirrorMap, startBeam: Beam) {
        let beams = [...executeBeamStep(mirrorMap, startBeam, true).newBeams];
        while (beams.length) {
            beams.forEach((beam) => {
                const { newBeams } = executeBeamStep(mirrorMap, beam);
                beams = [...beams.filter((x) => x !== beam), ...newBeams].filter((x) => !!x);
            });
            if (!beams.length) break;
        }
    }
    function resetMap(mirrorMap: MirrorMap) {
        MapEngine.iterateMap(mirrorMap, (cell) => {
            cell.value.isEnergized = undefined;
            cell.value.entries = [];
        });
    }
    function calculateEntry(mirrorMap: MirrorMap, x: number, y: number, direction: Directions): number {
        resetMap(mirrorMap);
        const beam: Beam = { location: MapEngine.getPoint(mirrorMap, x, y), direction };
        executeBeam(mirrorMap, beam);
        let energyCounter = 0;
        MapEngine.iterateMap(mirrorMap, (location) => {
            if (location.value.isEnergized) energyCounter++;
        });
        return energyCounter;
    }
    function buildMap(lines: string[]): MirrorMap {
        const map: MirrorMap = MapEngine.newMap<Mirror>();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                MapEngine.setPointInMap(map, x, y, { value: line[x], entries: [] });
            }
        }
        return map;
    }
    function getBestEntryScore(mirrorMap: MirrorMap): number {
        let output: number | undefined;
        const checkScore = (input: number) => {
            if (output === undefined || input > output) output = input;
        };
        const {minX, maxX, minY, maxY} = mirrorMap;
        for (let x = minX; x <= maxX; x++) {
            checkScore(calculateEntry(mirrorMap, x, minY, 'south'));
            checkScore(calculateEntry(mirrorMap, x, maxY, 'north'));
        }
        for (let y = minY; y <= maxY; y++) {
            checkScore(calculateEntry(mirrorMap, minX, y, 'south'));
            checkScore(calculateEntry(mirrorMap, maxX, y, 'north'));
        }

        return output;
    }
    export function part1(lines: string[]): number {
        const mirrorMap = buildMap(lines);
        return calculateEntry(mirrorMap, 0, 0, 'east');
    }
    export function part2(lines: string[]): number {
        const mirrorMap = buildMap(lines);
        return getBestEntryScore(mirrorMap);
    }
}

if (!module.parent) {
    const path = require('path');

    const main = async () => {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day16.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day16.input'),
            false,
        );

        console.log('part 1 example start');
        assert.equal(Y2023_Day16.part1(exampleLines), 46, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day16.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 8323);
        // part 2
        assert.equal(Y2023_Day16.part2(exampleLines), 51, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day16.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 8491);
    };

    main().catch((err) => console.error(err));
}
