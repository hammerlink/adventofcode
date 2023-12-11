import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';
import { MapEngine, BasicMap, MapLocation } from '../engine/map.engine';

export namespace Y2023_Day11 {
    type Space = {
        isGalaxy: boolean;
        galaxyId?: number;
        rawValue: string;
    };
    type SpaceCell = MapLocation<Space> & {
        map?: {
            [galaxyId: number]: { distance: number };
        };
    };

    type SpaceMap = BasicMap<Space>;

    function invertLines(lines: string[]): string[] {
        const output: string[] = [];
        const lineLength = lines[0].length;
        for (let i = 0; i < lineLength; i++) {
            let newLine = '';
            lines.forEach((line) => (newLine += line[i]));
            output.push(newLine);
        }
        return output;
    }
    function expandSpace(lines: string[]): string[] {
        const output: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            output.push(line);
            if (!line.match(/#/)) output.push(line);
        }
        return output;
    }

    export function part1(lines: string[]): number {
        // find all rows & columns without a galaxy
        lines = expandSpace(lines);
        lines = invertLines(lines); // invert
        lines = expandSpace(lines);
        lines = invertLines(lines); // return to original form

        // add extra empty row & column
        let galaxies: SpaceCell[] = [];
        let galaxyIdCounter = 1;
        let galaxyPairs: { lowId: number; highId: number; lowCell: SpaceCell; highCell: SpaceCell }[] = [];
        const spaceMap: SpaceMap = MapEngine.newMap();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                const isGalaxy = line[x] === '#';
                MapEngine.setPointInMap(spaceMap, x, y, {
                    isGalaxy,
                    galaxyId: isGalaxy ? galaxyIdCounter : undefined,
                    rawValue: line[x],
                });
                if (isGalaxy) {
                    galaxyIdCounter++;
                    galaxies.push(MapEngine.getPoint(spaceMap, x, y));
                }
            }
        }
        console.log('galaxies', galaxies.length);
        // combine all the pairs
        galaxies.forEach((galaxy) => {
            galaxies.forEach((otherGalaxy) => {
                if (otherGalaxy === galaxy) return;
                const lowId =
                    galaxy.value.galaxyId < otherGalaxy.value.galaxyId
                        ? galaxy.value.galaxyId
                        : otherGalaxy.value.galaxyId;
                const highId =
                    galaxy.value.galaxyId < otherGalaxy.value.galaxyId
                        ? otherGalaxy.value.galaxyId
                        : galaxy.value.galaxyId;
                const existing = galaxyPairs.find((x) => x.lowId === lowId && x.highId === highId);
                if (existing) return;
                galaxyPairs.push({
                    lowId,
                    highId,
                    lowCell: galaxy.value.galaxyId < otherGalaxy.value.galaxyId ? galaxy : otherGalaxy,
                    highCell: galaxy.value.galaxyId < otherGalaxy.value.galaxyId ? otherGalaxy : galaxy,
                });
            });
        });
        galaxyPairs.sort((a, b) => {
            if (a.lowId !== b.lowId) return a.lowId - b.lowId;
            return a.highId - b.highId;
        });
        return galaxyPairs.reduce((t, pair) => {
            const distance = Math.abs(pair.highCell.y - pair.lowCell.y) +Math.abs(pair.highCell.x - pair.lowCell.x);
            return t + distance;
        }, 0);
    }

    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day11.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day11.input'),
            false,
        );

        assert.equal(Y2023_Day11.part1(exampleLines), 374, 'example part 1');

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day11.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        // assert.equal(part1Result, 6613);

        // part 2
        assert.equal(Y2023_Day11.part2(exampleLines), 0, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day11.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 0);
    }

    main().catch((err) => console.error(err));
}
