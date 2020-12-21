import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';
import {BasicMap3D, MapEngine} from '../engine/map.engine';
import {BasicMap4D, Map4DEngine} from '../engine/map4d.engine';

export namespace Y2020_Day17 {
    export interface Cube {
        active: boolean;
    }

    export function parseInput(lines: string[]): BasicMap3D<Cube> {
        const map = MapEngine.newMap3D<Cube>();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                MapEngine.setPointInMap3D(map, x, y, 0, {active: line[x] === '#'});
            }
        }
        return map;
    }

    export function parseInput4D(lines: string[]): BasicMap4D<Cube> {
        const map = Map4DEngine.newMap4D<Cube>();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                Map4DEngine.setPointInMap4D(map, x, y, 0, 0, {active: line[x] === '#'});
            }
        }
        return map;
    }

    export function executeCycle(map: BasicMap3D<Cube>): BasicMap3D<Cube> {
        const newMap: BasicMap3D<Cube> = JSON.parse(JSON.stringify(map));
        const {minZ, maxZ, maxY, minY, maxX, minX,} = map;
        for (let x = minX - 1; x <= maxX + 1; x++) {
            for (let y = minY - 1; y <= maxY + 1; y++) {
                for (let z = minZ - 1; z <= maxZ + 1; z++) {
                    const isActive = MapEngine.getPoint3D(map, x, y, z)?.value.active;
                    let cube = MapEngine.getPoint3D(newMap, x, y, z);
                    if (!cube) cube = MapEngine.setPointInMap3D(newMap, x, y, z, {active: false});
                    const neighbours = MapEngine.getAdjacentPoints3D(map, x, y, z);
                    const activeNeighbours = neighbours.filter(x => x?.value.active);
                    if (isActive && (activeNeighbours.length < 2 || activeNeighbours.length > 3)) cube.value.active = false;
                    else if (!isActive && activeNeighbours.length === 3) {
                        cube.value.active = true;
                    }
                }
            }
        }
        return newMap;
    }

    export function countActiveCubes(map: BasicMap3D<Cube>): number {
        let total = 0;
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                for (let z = map.minZ; z <= map.maxZ; z++) {
                    if (MapEngine.getPoint3D(map, x, y, z)?.value?.active) total++;
                }
            }
        }
        return total;
    }

    export function part1(lines: string[]): number {
        let map = parseInput(lines);
        MapEngine.printMap3D(map, value => value?.value?.active ? '#' : '.');
        for (let i = 0; i < 6; i++) {
            map = executeCycle(map);
        }
        return countActiveCubes(map);
    }

    export function executeCycle4D(map: BasicMap4D<Cube>): BasicMap4D<Cube> {
        const newMap: BasicMap4D<Cube> = JSON.parse(JSON.stringify(map));
        const {minZ, maxZ, maxY, minY, maxX, minX, maxW, minW} = map;
        for (let x = minX - 1; x <= maxX + 1; x++) {
            for (let y = minY - 1; y <= maxY + 1; y++) {
                for (let z = minZ - 1; z <= maxZ + 1; z++) {
                    for (let w = minW - 1; w <= maxW + 1; w++) {
                        const isActive = Map4DEngine.getPoint4D(map, x, y, z, w)?.value.active;
                        let cube = Map4DEngine.getPoint4D(newMap, x, y, z, w);
                        if (!cube) cube = Map4DEngine.setPointInMap4D(newMap, x, y, z, w, {active: false});
                        const neighbours = Map4DEngine.getAdjacentPoints4D(map, x, y, z, w);
                        const activeNeighbours = neighbours.filter(x => x?.value.active);
                        if (isActive && (activeNeighbours.length < 2 || activeNeighbours.length > 3)) cube.value.active = false;
                        else if (!isActive && activeNeighbours.length === 3) {
                            cube.value.active = true;
                        }
                    }
                }
            }
        }
        return newMap;
    }

    export function countActiveCubes4D(map: BasicMap4D<Cube>): number {
        let total = 0;
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                for (let z = map.minZ; z <= map.maxZ; z++) {
                    for (let w = map.minW; w <= map.maxW; w++) {
                        if (Map4DEngine.getPoint4D(map, x, y, z, w)?.value?.active) total++;
                    }
                }
            }
        }
        return total;
    }

    export function part2(lines: string[]): number {
        let map = parseInput4D(lines);
        Map4DEngine.printMap4D(map, value => value?.value?.active ? '#' : '.');
        for (let i = 0; i < 6; i++) {
            map = executeCycle4D(map);
        }
        return countActiveCubes4D(map);
    }

}


if (!module.parent) {
    const path = require('path');

    async function main() {

        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day17.example'));

        assert.strictEqual(Y2020_Day17.part1(exampleLines), 112, 'example 1 part 1');

        assert.strictEqual(Y2020_Day17.part2(exampleLines), 848, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day17.input'));
        // part 1
        const part1Result = Y2020_Day17.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day17.part2(lines);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
