import {MapLocation} from './map.engine';


export interface MapLocation4D<T> extends MapLocation<T>{
    z: number;
    w: number;
}

export interface BasicMap4D<T> {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    minW: number;
    maxW: number;

    [x: number]: {
        [y: number]: {
            [z: number]: {
                [w: number]: MapLocation4D<T>;
            };
        };
    }
}

export namespace Map4DEngine {
    export function newMap4D<T>(startX: number = 0, startY: number = 0, startZ: number = 0, startW: number = 0): BasicMap4D<T> {
        return {
            minX: startX,
            maxX: startX,
            minY: startY,
            maxY: startY,
            minZ: startZ,
            maxZ: startZ,
            minW: startW,
            maxW: startW,
        };
    }

    export function setPointInMap4D<T>(map: BasicMap4D<T>, x: number, y: number, z: number, w: number, value: T): MapLocation4D<T> {
        if (!map[x]) map[x] = {};
        if (!map[x][y]) map[x][y] = {};
        if (!map[x][y][z]) map[x][y][z] = {};
        if (!map[x][y][z][w]) map[x][y][z][w] = {x, y, z, w, value: null};
        map[x][y][z][w].value = value;
        if (map.minZ === null || z < map.minZ) map.minZ = z;
        if (map.maxZ === null || z > map.maxZ) map.maxZ = z;
        if (map.minW === null || w < map.minW) map.minW = w;
        if (map.maxW === null || w > map.maxW) map.maxW = w;
        if (map.minX === null || x < map.minX) map.minX = x;
        if (map.maxX === null || x > map.maxX) map.maxX = x;
        if (map.minY === null || y < map.minY) map.minY = y;
        if (map.maxY === null || y > map.maxY) map.maxY = y;
        return map[x][y][z][w];
    }

    export function getPoint4D<T>(map: BasicMap4D<T>, x: number, y: number, z: number, w: number): MapLocation4D<T> | null {
        if (!map[x]) return null;
        if (!map[x][y]) return null;
        if (!map[x][y][z]) return null;
        if (!map[x][y][z][w]) return null;
        return map[x][y][z][w];
    }

    export function printMap4D<T>(map: BasicMap4D<T>, getValue: (location: MapLocation4D<T>) => string, printIndex = false) {
        const maxLength = `${map.maxY}`.length;
        for (let w = map.minW; w <= map.maxW; w++) {
            console.log('w', w);
            for (let z = map.minZ; z <= map.maxZ; z++) {
                console.log('z', z);
                for (let y = map.minY; y <= map.maxY; y++) {
                    let line = `${printIndex ? getPrintIndex(y, maxLength): ''}`;
                    for (let x = map.minX; x <= map.maxX; x++) {
                        const location = getPoint4D(map, x, y , z, w);
                        line += `${getValue(location)} `;
                    }
                    console.log(line);
                }
            }
        }


    }

    export function getPrintIndex(y: number, maxLength: number): string {
        let index = `${y}`;
        while (index.length < maxLength) index += ' ';
        return index;
    }

    export function getAdjacentPoints4D<T>(map: BasicMap4D<T>, x: number, y: number, z: number, w: number): MapLocation4D<T>[] {
        const output: MapLocation4D<T>[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    for (let dw = -1; dw <= 1; dw++) {
                        if (dx === 0 && dy === 0 && dz === 0 && dw === 0) continue;
                        output.push(getPoint4D(map, x + dx , y + dy, z + dz, w + dw));
                    }
                }
            }
        }
        return output;
    }
}
