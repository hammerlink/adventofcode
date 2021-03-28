import * as assert from 'assert';
import {BasicMap, MapEngine, MapLocation} from '../engine/map.engine';
import {FileEngine} from '../engine/file.engine';

export namespace Y2020_Day24 {
    export const directions = [
        'e',
        'se',
        'sw',
        'w',
        'nw',
        'ne',
    ];
    const oppositeDirections = {
        'e': 'w',
        'se': 'nw',
        'sw': 'ne',
        'w': 'e',
        'nw': 'se',
        'ne': 'sw',
    };
    const directionMovement: {[key: string]: (x: number, y: number) => {x: number, y: number}} = {
        'e': (x, y) => ({x: x + 2, y}),
        'se': (x, y) => ({x: x + 1, y: y - 1}),
        'sw': (x, y) => ({x: x - 1, y: y - 1}),
        'w': (x, y) => ({x: x - 2, y}),
        'ne': (x, y) => ({x: x + 1, y: y + 1}),
        'nw': (x, y) => ({x: x - 1, y: y + 1}),
    };

    export interface TileMap<T> extends BasicMap<T> {
        tiles: MapLocation<Tile>[];
    }

    export interface Tile {
        neighbours: {
            'e'?: Tile,
            'se'?: Tile,
            'sw'?: Tile,
            'w'?: Tile,
            'nw'?: Tile,
            'ne'?: Tile,
            };
        x, y, flipCount: number;
        day?: number;
    }

    export function getNextDirection(path: string): {path: string, direction: string} {
        for (let i = 0; i < directions.length; i++) {
            const direction = directions[i];
            if (path.startsWith(direction)) {
                return {direction, path: path.replace(direction, '')};
            }
        }
        throw new Error(`no direction found for path: ${path}`);
    }

    export function executePath(tiles: Tile[], map: TileMap<Tile>, path: string) {
        let currentTile = tiles[0];
        let currentPath = path;
        let x = 0, y = 0;
        while (currentPath.length) {
            const {path, direction} = getNextDirection(currentPath);
            currentPath = path;
            const movement = directionMovement[direction](x, y);
            x = movement.x;
            y = movement.y;
            const point = MapEngine.getPoint(map, x, y);
            if (point) {
                updateNeighboursOnMap(map, point);
                currentTile = point.value;
                continue;
            }
            const newTilePoint = addPointOnMap(map, x, y);
            tiles.push(newTilePoint.value);
            currentTile = newTilePoint.value;
        }
        currentTile.flipCount++;
    }

    export function part1(lines: string[]): number {
        const map = {
            ...MapEngine.newMap<Tile>(),
            tiles: [],
        };
        const tiles: Tile[] = [{flipCount: 0, x: 0, y : 0, neighbours: {}}];
        lines.forEach(path => executePath(tiles, map, path));
        return tiles.reduce(((previousValue, currentValue) =>
            previousValue + (currentValue.flipCount % 2 === 1 ? 1 : 0)), 0);
    }

    export function addPointOnMap(map: TileMap<Tile>, x: number, y: number): MapLocation<Tile> {
        const newTile = {neighbours: {}, flipCount: 0, x, y};
        const mapLocation = MapEngine.setPointInMap(map, x, y, newTile);
        map.tiles.push(mapLocation);
        updateNeighboursOnMap(map, mapLocation);
        return mapLocation;
    }

    export function updateNeighboursOnMap(map: TileMap<Tile>, point: MapLocation<Tile>) {
        const {x, y} = point;
        for (let i = 0; i < directions.length; i++) {
            const direction = directions[i];
            const movement = directionMovement[direction](x, y);
            const neighbourPoint = MapEngine.getPoint(map, movement.x, movement.y);
            if (neighbourPoint) {
                point.value.neighbours[direction] = neighbourPoint.value;
                neighbourPoint.value.neighbours[oppositeDirections[direction]] = point.value;
            }
        }
    }

    export function getTilesToFlip(map: TileMap<Tile>, point: MapLocation<Tile>, tilesToFlip: Tile[], day:  number) {
        // black = uneven, white = even
        const tile = point.value;
        if (tile.day === day) return;
        tile.day = day;
        const isBlack = tile.flipCount % 2 === 1;
        let blackNeighbours = 0;
        for (const direction in tile.neighbours) {
            const neighbourTile = tile.neighbours[direction];
            if (neighbourTile.flipCount % 2 === 1) blackNeighbours++;
        }
        if (isBlack && (blackNeighbours > 2 || blackNeighbours === 0)) tilesToFlip.push(tile);
        if (!isBlack && blackNeighbours === 2) tilesToFlip.push(tile);

        if (!isBlack && blackNeighbours === 0) return;
        for (let i = 0; i < directions.length; i++) {
            const direction = directions[i];
            const movement = directionMovement[direction](point.x, point.y);
            let neighbourPoint = MapEngine.getPoint(map, movement.x, movement.y);
            if (neighbourPoint && !tile.neighbours[direction]) throw new Error(`neighbours were badly updated`);
            if (!neighbourPoint) neighbourPoint = addPointOnMap(map, movement.x, movement.y);
        }
    }

    export function letTilesLive(map: TileMap<Tile>, day: number) {
        const tilesToFlip: Tile[] = [];
        for (let i = 0; i < map.tiles.length; i++) getTilesToFlip(map, map.tiles[i], tilesToFlip, day);
        tilesToFlip.forEach(tile => tile.flipCount++);
    }

    export function part2(lines: string[], iterations = 100): number {
        const map: TileMap<Tile> = {
            ...MapEngine.newMap<Tile>(),
            tiles: [],
        };
        addPointOnMap(map, 0, 0)
        const tiles: Tile[] = [map.tiles[0].value];
        lines.forEach(path => executePath(tiles, map, path));
        for (let i = 1; i < iterations+1; i++) {
            letTilesLive(map, i);
        }
        let blackCount = 0;
        MapEngine.iterateMap(map, l => {
            if (l && l.value.flipCount % 2 === 1) blackCount++;
        });
        return blackCount;
    }

}

if (!module.parent) {
    const path = require('path');

    const example = `sesenwnenenewseeswwswswwnenewsewsw
neeenesenwnwwswnenewnwwsewnenwseswesw
seswneswswsenwwnwse
nwnwneseeswswnenewneswwnewseswneseene
swweswneswnenwsewnwneneseenw
eesenwseswswnenwswnwnwsewwnwsene
sewnenenenesenwsewnenwwwse
wenwwweseeeweswwwnwwe
wsweesenenewnwwnwsenewsenwwsesesenwne
neeswseenwwswnwswswnw
nenwswwsewswnenenewsenwsenwnesesenew
enewnwewneswsewnwswenweswnenwsenwsw
sweneswneswneneenwnewenewwneswswnese
swwesenesewenwneswnwwneseswwne
enesenwswwswneneswsenwnewswseenwsese
wnwnesenesenenwwnenwsewesewsesesew
nenewswnwewswnenesenwnesewesw
eneswnwswnwsenenwnwnwwseeswneewsenese
neswnwewnwnwseenwseesewsenwsweewe
wseweeenwnesenwwwswnew`.split('\n');

    async function main() {
        assert.strictEqual(Y2020_Day24.part1(example), 10, 'example 1 part 1');

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day24.input'), false);
        // part 1
        const part1Result = Y2020_Day24.part1(lines);
        console.log(part1Result);

        assert.strictEqual(Y2020_Day24.part2(example, 3), 25, 'example 1 part 2');

        // part 2
        const part2Result = Y2020_Day24.part2(lines);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
