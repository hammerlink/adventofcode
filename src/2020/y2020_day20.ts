import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';
import {BasicMap, MapEngine} from '../engine/map.engine';

export namespace Y2020_Day20 {
    export interface Tile {
        map: BasicMap<TilePoint>,
        tileId: number
        borders: { [orientationKey: number]: string };
        imagePosition?: { x: number, y: number };
        searching?: boolean;
    }

    export interface TilePoint {
        value: string;
        isSeaMonster?: boolean;
    }

    export enum Orientation {
        NORTH = 'NORTH',
        SOUTH = 'SOUTH',
        EAST = 'EAST',
        WEST = 'WEST',
    }

    export interface ImagePoint {
        tile: Tile,
        rotation: number
    }

    export const seaMonster = [
        `                  # `,
        `#    ##    ##    ###`,
        ` #  #  #  #  #  #   `,
    ].map(line => {
        const matches = line.matchAll(/#/g);
        const indices = [];
        let done = false;
        do {
            const nextMatch = matches.next();
            if (nextMatch.value) indices.push(nextMatch.value.index);
            done = nextMatch.done;
        } while (!done);
        return indices;
    }).reduce((totalList, newList) => {
        totalList.push(newList)
        return totalList;
    }, []);

    const orientationAction: {
        [orientationKey: string]: {
            action: {
                [orientationKey: string]: (map: BasicMap<TilePoint>) => BasicMap<TilePoint>,
            },
            defaultReverse: { [orientationKey: string]: boolean };
            reverse: (map: BasicMap<TilePoint>) => BasicMap<TilePoint>,
        }
    } = {
        [Orientation.NORTH]: {
            defaultReverse: {[Orientation.EAST]: true,},
            action: {
                [Orientation.NORTH]: MapEngine.flipMapYAxis,
                [Orientation.EAST]: MapEngine.rotateRight,
                [Orientation.WEST]: MapEngine.rotateLeft
            },
            reverse: MapEngine.flipMapXAxis,
        },
        [Orientation.SOUTH]: {
            defaultReverse: {[Orientation.WEST]: true,},
            action: {
                [Orientation.SOUTH]: MapEngine.flipMapYAxis,
                [Orientation.EAST]: MapEngine.rotateLeft,
                [Orientation.WEST]: MapEngine.rotateRight,
            },
            reverse: MapEngine.flipMapXAxis,
        },
        [Orientation.EAST]: {
            defaultReverse: {[Orientation.NORTH]: true,},
            action: {
                [Orientation.SOUTH]: MapEngine.rotateRight,
                [Orientation.NORTH]: MapEngine.rotateLeft,
                [Orientation.EAST]: MapEngine.flipMapXAxis,
            },
            reverse: MapEngine.flipMapYAxis,
        },
        [Orientation.WEST]: {
            defaultReverse: {[Orientation.SOUTH]: true,},
            action: {
                [Orientation.SOUTH]: MapEngine.rotateLeft,
                [Orientation.NORTH]: MapEngine.rotateRight,
                [Orientation.WEST]: MapEngine.flipMapXAxis,
            },
            reverse: MapEngine.flipMapYAxis,
        },
    };

    export function readInput(lines: string[]): Tile[] {
        const output: Tile[] = [];
        let tileLines: string[] = [];
        let tileId: number;
        lines.forEach(line => {
            const match = line.match(/Tile (\d+):/);
            if (match) {
                if (tileLines.length) output.push(parseTileLines(tileId, tileLines));
                tileId = parseInt(match[1], 10);
                tileLines = [];
            } else if (line) tileLines.push(line);
        });

        if (tileLines.length) output.push(parseTileLines(tileId, tileLines));

        return output;
    }

    export function parseTileLines(tileId: number, lines: string[]): Tile {
        const map = MapEngine.newMap<TilePoint>();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                MapEngine.setPointInMap(map, x, y, {value: line[x]});
            }
        }
        const borders = getAllBorders(map);
        return {map, tileId, borders};
    }

    export function getAllBorders(map: BasicMap<TilePoint>): { [orientationKey: number]: string } {
        const {maxX, minX, maxY} = map;
        if (maxX !== maxY) throw new Error('mismatching sizes');
        const borders: { [key: string]: string } = {
            [Orientation.NORTH]: '',
            [Orientation.SOUTH]: '',
            [Orientation.EAST]: '',
            [Orientation.WEST]: '',
        };
        for (let i = minX; i <= maxX; i++) {
            borders[Orientation.NORTH] += MapEngine.getPoint(map, i, minX).value.value;
            borders[Orientation.SOUTH] += MapEngine.getPoint(map, i, maxX).value.value;
            borders[Orientation.EAST] += MapEngine.getPoint(map, maxX, i).value.value;
            borders[Orientation.WEST] += MapEngine.getPoint(map, minX, i).value.value;
        }
        return borders;
    }

    export function oppositeOrientation(orientation: Orientation): Orientation {
        if (orientation === Orientation.EAST) return Orientation.WEST;
        if (orientation === Orientation.WEST) return Orientation.EAST;
        if (orientation === Orientation.NORTH) return Orientation.SOUTH;
        if (orientation === Orientation.SOUTH) return Orientation.NORTH;
    }

    export function mergeTiles(tileA: Tile, tileB: Tile, border: string, imageMap: BasicMap<ImagePoint>) {
        const reverseBorder = border.split('').reverse().join('');
        const borderMatchA = getBorder(tileA, border, reverseBorder)[0];
        const borderMatchB = getBorder(tileB, border, reverseBorder)[0];
        const transformation = transformTile(borderMatchA.orientation as Orientation, borderMatchB.orientation as Orientation,
            borderMatchA.reverse !== borderMatchB.reverse, tileB.map);
        if (transformation.altered) {
            tileB.map = transformation.map;
            const newBorders = getAllBorders(tileB.map);
            if (newBorders[oppositeOrientation(borderMatchA.orientation as Orientation)] !== tileA.borders[borderMatchA.orientation]) {
                const x = null;
            }
            tileB.borders = newBorders;
        }
        const {x, y} = getDirection(borderMatchA.orientation as Orientation, tileA.imagePosition.x, tileA.imagePosition.y);
        const existingPoint = MapEngine.getPoint(imageMap, x, y);
        if (existingPoint) {
            MapEngine.printMap(imageMap, x => !!x?.value.tile.tileId ? '' + x?.value.tile.tileId : '----');
            throw new Error(`point exists`);
        }
        tileB.imagePosition = {x, y};
        MapEngine.setPointInMap(imageMap, x, y, {tile: tileB, rotation: 0});
    }

    export function getBorder(tile: Tile, border: string, reverseBorder: string): { orientation: string, reverse: boolean }[] {
        const matches = [];
        for (const orientation in tile.borders) {
            if (tile.borders[orientation] === border) matches.push({orientation, reverse: false});
            else if (tile.borders[orientation] === reverseBorder) matches.push({orientation, reverse: true});
        }
        if (matches.length > 1) throw new Error('tile with multiple identitical sides');
        return matches;
    }

    export function transformTile(startOrientation: Orientation, tileOrientation: Orientation, reverse: boolean,
                                  tileMap: BasicMap<TilePoint>): { map: BasicMap<TilePoint>, altered: boolean, defaultReverse: boolean } {
        const action = orientationAction[startOrientation].action[tileOrientation];
        let altered = false;
        if (action) {
            tileMap = action(tileMap);
            altered = true;
        }
        const defaultReverse = orientationAction[startOrientation].defaultReverse[tileOrientation];
        if (!!defaultReverse !== reverse) {
            tileMap = orientationAction[startOrientation].reverse(tileMap);
            altered = true;
        }
        return {map: tileMap, altered, defaultReverse};
    }

    export function getDirection(orientation: Orientation, x: number, y: number): { x: number, y: number } {
        if (orientation === Orientation.NORTH) return {x, y: y - 1};
        if (orientation === Orientation.SOUTH) return {x, y: y + 1};
        if (orientation === Orientation.EAST) return {x: x + 1, y};
        if (orientation === Orientation.WEST) return {x: x - 1, y};
        throw new Error(`unknown orientation, ${orientation}`);
    }

    export function mapAllBorderMatches(tiles: Tile[]): { border: string, tiles: Tile[], done?: boolean }[] {
        const borderMatches: { [border: string]: Tile[] } = {};
        tiles.forEach(tile => {
            for (const orientation in tile.borders) {
                const border = tile.borders[orientation];
                const reverseBorder = border.split('').reverse().join('');
                if (borderMatches[border]) borderMatches[border].push(tile);
                else if (borderMatches[reverseBorder]) borderMatches[reverseBorder].push(tile);
                else borderMatches[border] = [tile];
            }
        });
        const sortedMatches: { border: string, tiles: Tile[] }[] = [];
        for (const border in borderMatches) {
            sortedMatches.push({border, tiles: borderMatches[border]});
        }
        sortedMatches.sort((a, b) => a.tiles.length - b.tiles.length);
        return sortedMatches.filter(x => x.tiles.length > 1);
    }

    export function constructMap(tiles: Tile[], imageMap: BasicMap<ImagePoint>) {
        const sortedMatches = mapAllBorderMatches(tiles);
        const startTile = tiles[0];
        startTile.imagePosition = {x: 0, y: 0};
        MapEngine.setPointInMap(imageMap, 0, 0, {tile: startTile, rotation: 0});

        let done = false;
        while (!done) {
            done = true;
            sortedMatches.forEach((match, index) => {
                if (match.done) return;
                const remainingTiles = match.tiles.filter(x => !x.imagePosition);
                if (remainingTiles.length === 1) {
                    const mappedTiles = match.tiles.filter(x => !!x.imagePosition);
                    if (mappedTiles.length === 1) mergeTiles(mappedTiles[0], remainingTiles[0], match.border, imageMap);
                    else throw new Error('multiple options');
                    // check which match now
                    match.done = true;
                } else if (remainingTiles.length === 0) match.done = true;

                if (!match.done) done = false;
            });
        }
    }

    export function part1(lines: string[]): number {
        const imageMap = MapEngine.newMap<ImagePoint>();
        const tiles = readInput(lines);
        constructMap(tiles, imageMap);
        const leftBottom = MapEngine.getPoint(imageMap, imageMap.minX, imageMap.maxY).value.tile.tileId;
        const leftTop = MapEngine.getPoint(imageMap, imageMap.minX, imageMap.minY).value.tile.tileId;
        const rightBottom = MapEngine.getPoint(imageMap, imageMap.maxX, imageMap.maxY).value.tile.tileId;
        const rightTop = MapEngine.getPoint(imageMap, imageMap.maxX, imageMap.minY).value.tile.tileId;
        return leftBottom * leftTop * rightBottom * rightTop;
    }

    export function writeTileContent(tile: Tile, xMap: number, yMap: number, tileMap: BasicMap<TilePoint>) {
        const {map} = tile;
        for (let y = map.minY + 1; y < map.maxY; y++) {
            for (let x = map.minX + 1; x < map.maxX; x++) {
                const point = MapEngine.getPoint(map, x, y);
                MapEngine.setPointInMap(tileMap, xMap + x - 1, yMap + y - 1, point.value);
            }
        }
    }

    export function markSeaMonsters(tileMap: BasicMap<TilePoint>) {
        for (let y = tileMap.minY; y <= tileMap.maxY; y++) {
            for (let x = tileMap.minX; x <= tileMap.maxX; x++) {
                if (isStartOfSeaMonster(tileMap, x, y)) {
                    console.log(`seaMonster`, x, y);
                    markSeaMonster(tileMap, x, y);
                }
            }
        }
    }

    export function markSeaMonster(tileMap: BasicMap<TilePoint>, x: number, y: number): boolean {
        for (let sY = 0; sY < seaMonster.length; sY++) {
            for (let i = 0; i < seaMonster[sY].length; i++) {
                const index = seaMonster[sY][i];
                const point = MapEngine.getPoint(tileMap, x + index, y + sY);
                point.value.isSeaMonster = true;
            }
        }
        return true;
    }

    export function isStartOfSeaMonster(tileMap: BasicMap<TilePoint>, x: number, y: number): boolean {
        if (x + 19 > tileMap.maxX) return false;
        if (y + 2 > tileMap.maxY) return false;
        for (let sY = 0; sY < seaMonster.length; sY++) {
            for (let i = 0; i < seaMonster[sY].length; i++) {
                const index = seaMonster[sY][i];
                const point = MapEngine.getPoint(tileMap, x + index, y + sY);
                if (point?.value.value !== '#') return false;
            }
        }
        return true;
    }

    export function fullyScanMap(tileMap: BasicMap<TilePoint>) {
        markSeaMonsters(tileMap);
        tileMap = MapEngine.flipMapXAxis(tileMap);
        markSeaMonsters(tileMap);
        tileMap = MapEngine.flipMapYAxis(tileMap);
        markSeaMonsters(tileMap);
        tileMap = MapEngine.flipMapXAxis(tileMap);
        markSeaMonsters(tileMap);
        tileMap = MapEngine.rotateLeft(tileMap);
        markSeaMonsters(tileMap);
        tileMap = MapEngine.flipMapXAxis(tileMap);
        markSeaMonsters(tileMap);
        tileMap = MapEngine.flipMapYAxis(tileMap);
        markSeaMonsters(tileMap);
        tileMap = MapEngine.flipMapXAxis(tileMap);
        markSeaMonsters(tileMap);
    }

    export function part2(lines: string[]): number {
        const imageMap = MapEngine.newMap<ImagePoint>();
        const tiles = readInput(lines);
        constructMap(tiles, imageMap);
        let tileMap = MapEngine.newMap<TilePoint>();
        for (let y = imageMap.minY; y <= imageMap.maxY; y++) {
            for (let x = imageMap.minX; x <= imageMap.maxX; x++) {
                writeTileContent(MapEngine.getPoint(imageMap, x, y).value.tile, x * 8, y * 8, tileMap);
            }
        }
        tileMap = MapEngine.flipMapYAxis(tileMap);
        MapEngine.printMap(tileMap, x => x?.value?.isSeaMonster ? 'O' : x?.value?.value, false, false);
        fullyScanMap(tileMap);
        let counter = 0;
        for (let y = tileMap.minY; y <= tileMap.maxY; y++) {
            for (let x = tileMap.minX; x <= tileMap.maxX; x++) {
                const point = MapEngine.getPoint(tileMap, x, y);
                if (point.value.value === '#' && !point.value.isSeaMonster) counter++;
            }
        }
        return counter;
    }

}


if (!module.parent) {
    const path = require('path');

    async function main() {

        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day20.example'), false);

        assert.strictEqual(Y2020_Day20.part1(exampleLines), 20899048083289, 'example 1 part 1');

        assert.strictEqual(Y2020_Day20.part2(exampleLines), 273, 'example 1 part 2');

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day20.input'), false);
        // part 1
        const part1Result = Y2020_Day20.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day20.part2(lines);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
