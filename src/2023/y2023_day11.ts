import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';
import { MapEngine, BasicMap, MapLocation } from '../engine/map.engine';

export namespace Y2023_Day11 {
    type Space = {
        isGalaxy: boolean;
        galaxyId?: number;
        rawValue: string;
        isEmptyX?: boolean;
        isEmptyY?: boolean;
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
    function expandSpace(lines: string[], amount = 1): string[] {
        const output: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            output.push(line);
            if (!line.match(/#/)) {
                for (let i = 0; i < amount; i++) output.push(line);
            }
        }
        return output;
    }
    function getAllEmptySpaceLines(lines: string[]): number[] {
        const output: number[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].match(/#/)) output.push(i);
        }
        return output;
    }
    type GalaxyPair = { lowId: number; highId: number; lowCell: SpaceCell; highCell: SpaceCell };
    function getGalaxyPairs(galaxies: SpaceCell[]): GalaxyPair[] {
        const output: GalaxyPair[] = [];
        for (let i = 0; i < galaxies.length; i++) {
            const galaxy = galaxies[i];
            for (let j = i + 1; j < galaxies.length; j++) {
                const otherGalaxy = galaxies[j];
                const lowId =
                    galaxy.value.galaxyId < otherGalaxy.value.galaxyId
                        ? galaxy.value.galaxyId
                        : otherGalaxy.value.galaxyId;
                const highId =
                    galaxy.value.galaxyId < otherGalaxy.value.galaxyId
                        ? otherGalaxy.value.galaxyId
                        : galaxy.value.galaxyId;
                const existing = output.find((x) => x.lowId === lowId && x.highId === highId);
                if (existing) return;
                output.push({
                    lowId,
                    highId,
                    lowCell: galaxy.value.galaxyId < otherGalaxy.value.galaxyId ? galaxy : otherGalaxy,
                    highCell: galaxy.value.galaxyId < otherGalaxy.value.galaxyId ? otherGalaxy : galaxy,
                });
            }
        }
        return output;
    }

    export function part1(lines: string[]): number {
        const start = Date.now();
        // find all rows & columns without a galaxy
        console.log('pre parsing');
        const emptyYIndices = getAllEmptySpaceLines(lines);
        // lines = expandSpace(lines);
        lines = invertLines(lines); // invert
        const emptyXIndices = getAllEmptySpaceLines(lines);
        // lines = expandSpace(lines);
        lines = invertLines(lines); // return to original form

        console.log('draw map', Date.now() - start);
        // add extra empty row & column
        let galaxies: SpaceCell[] = [];
        let galaxyIdCounter = 1;
        const spaceMap: SpaceMap = MapEngine.newMap();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                const isGalaxy = line[x] === '#';
                MapEngine.setPointInMap(spaceMap, x, y, {
                    isGalaxy,
                    galaxyId: isGalaxy ? galaxyIdCounter : undefined,
                    rawValue: line[x],
                    isEmptyX: emptyXIndices.includes(x),
                    isEmptyY: emptyYIndices.includes(y),
                });
                if (isGalaxy) {
                    galaxyIdCounter++;
                    galaxies.push(MapEngine.getPoint(spaceMap, x, y));
                }
            }
        }
        console.log('galaxies', galaxies.length, Date.now() - start);
        // combine all the pairs

        const galaxyPairs: GalaxyPair[] = getGalaxyPairs(galaxies);
        console.log('sort', Date.now() - start);
        galaxyPairs.sort((a, b) => {
            if (a.lowId !== b.lowId) return a.lowId - b.lowId;
            return a.highId - b.highId;
        });
        console.log('reduce', Date.now() - start);
        const extraBase = 1;
        return galaxyPairs.reduce((t, pair) => {
            let distance = 0;
            const minX = pair.lowCell.x < pair.highCell.x ? pair.lowCell.x : pair.highCell.x;
            const maxX = pair.lowCell.x > pair.highCell.x ? pair.lowCell.x : pair.highCell.x;
            distance += maxX - minX;
            for (let x = minX + 1; x <= maxX; x++) {
                if (emptyXIndices.includes(x)) distance += extraBase;
            }
            const minY = pair.lowCell.y < pair.highCell.y ? pair.lowCell.y : pair.highCell.y;
            const maxY = pair.lowCell.y > pair.highCell.y ? pair.lowCell.y : pair.highCell.y;
            distance += maxY - minY;
            for (let y = minY + 1; y <= maxY; y++) {
                if (emptyYIndices.includes(y)) distance += extraBase;
            }
            return t + distance;
        }, 0);
    }

    export function part2(lines: string[], extraBase = 1000000): number {
        const start = Date.now();
        // find all rows & columns without a galaxy
        console.log('pre parsing');
        const emptyYIndices = getAllEmptySpaceLines(lines);
        // lines = expandSpace(lines);
        lines = invertLines(lines); // invert
        const emptyXIndices = getAllEmptySpaceLines(lines);
        // lines = expandSpace(lines);
        lines = invertLines(lines); // return to original form

        console.log('draw map', Date.now() - start);
        // add extra empty row & column
        let galaxies: SpaceCell[] = [];
        let galaxyIdCounter = 1;
        const spaceMap: SpaceMap = MapEngine.newMap();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                const isGalaxy = line[x] === '#';
                MapEngine.setPointInMap(spaceMap, x, y, {
                    isGalaxy,
                    galaxyId: isGalaxy ? galaxyIdCounter : undefined,
                    rawValue: line[x],
                    isEmptyX: emptyXIndices.includes(x),
                    isEmptyY: emptyYIndices.includes(y),
                });
                if (isGalaxy) {
                    galaxyIdCounter++;
                    galaxies.push(MapEngine.getPoint(spaceMap, x, y));
                }
            }
        }
        console.log('galaxies', galaxies.length, Date.now() - start);
        // combine all the pairs
        const galaxyPairs: GalaxyPair[] = getGalaxyPairs(galaxies);
        console.log('sort', Date.now() - start);
        galaxyPairs.sort((a, b) => {
            if (a.lowId !== b.lowId) return a.lowId - b.lowId;
            return a.highId - b.highId;
        });
        console.log('reduce', Date.now() - start);
        return galaxyPairs.reduce((t, pair) => {
            let distance = 0;
            const minX = pair.lowCell.x < pair.highCell.x ? pair.lowCell.x : pair.highCell.x;
            const maxX = pair.lowCell.x > pair.highCell.x ? pair.lowCell.x : pair.highCell.x;
            distance += maxX - minX;
            for (let x = minX + 1; x <= maxX; x++) {
                if (emptyXIndices.includes(x)) distance += extraBase - 1;
            }
            const minY = pair.lowCell.y < pair.highCell.y ? pair.lowCell.y : pair.highCell.y;
            const maxY = pair.lowCell.y > pair.highCell.y ? pair.lowCell.y : pair.highCell.y;
            distance += maxY - minY;
            for (let y = minY + 1; y <= maxY; y++) {
                if (emptyYIndices.includes(y)) distance += extraBase - 1;
            }
            return t + distance;
        }, 0);
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
        // const part1Result = Y2023_Day11.part1(lines);
        // console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        // assert.equal(part1Result, 10231178);

        // part 2
        assert.equal(Y2023_Day11.part2(exampleLines, 10), 1030, 'example part 2');
        assert.equal(Y2023_Day11.part2(exampleLines, 100), 8410, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day11.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // not 622121609066 too high
        assert.equal(part2Result, 622120986954);
    }

    main().catch((err) => console.error(err));
}
