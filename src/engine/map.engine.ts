export interface MapLocation<T> {
    x: number;
    y: number;
    value: T;
}

export interface MapLocation3D<T> extends MapLocation<T> {
    z: number;
}

export interface BasicMap<T> {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;

    [x: number]: {
        [y: number]: MapLocation<T>;
    };
}

export interface BasicMap3D<T> {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;

    [x: number]: {
        [y: number]: {
            [z: number]: MapLocation3D<T>;
        };
    };
}

export namespace MapEngine {
    export function newMap<T>(startX: number = 0, startY: number = 0): BasicMap<T> {
        return {
            minX: startX,
            maxX: startX,
            minY: startY,
            maxY: startY,
        };
    }

    export function newMap3D<T>(startX: number = 0, startY: number = 0, startZ: number = 0): BasicMap3D<T> {
        return {
            minX: startX,
            maxX: startX,
            minY: startY,
            maxY: startY,
            minZ: startZ,
            maxZ: startZ,
        };
    }

    export function setPointInMap<T>(map: BasicMap<T>, x: number, y: number, value: T): MapLocation<T> {
        if (!map[x]) map[x] = {};
        if (!map[x][y]) map[x][y] = { x, y, value: null };
        map[x][y].value = value;
        if (map.minX === null || x < map.minX) map.minX = x;
        if (map.maxX === null || x > map.maxX) map.maxX = x;
        if (map.minY === null || y < map.minY) map.minY = y;
        if (map.maxY === null || y > map.maxY) map.maxY = y;
        return map[x][y];
    }

    export function setPointInMap3D<T>(
        map: BasicMap3D<T>,
        x: number,
        y: number,
        z: number,
        value: T,
    ): MapLocation3D<T> {
        if (!map[x]) map[x] = {};
        if (!map[x][y]) map[x][y] = {};
        if (!map[x][y][z]) map[x][y][z] = { x, y, z, value: null };
        map[x][y][z].value = value;
        if (map.minZ === null || z < map.minZ) map.minZ = z;
        if (map.maxZ === null || z > map.maxZ) map.maxZ = z;
        if (map.minX === null || x < map.minX) map.minX = x;
        if (map.maxX === null || x > map.maxX) map.maxX = x;
        if (map.minY === null || y < map.minY) map.minY = y;
        if (map.maxY === null || y > map.maxY) map.maxY = y;
        return map[x][y][z];
    }

    export function getPoint<T>(map: BasicMap<T>, x: number, y: number): MapLocation<T> | null {
        if (!map[x]) return null;
        if (!map[x][y]) return null;
        return map[x][y];
    }

    export function getPoint3D<T>(map: BasicMap3D<T>, x: number, y: number, z: number): MapLocation3D<T> | null {
        if (!map[x]) return null;
        if (!map[x][y]) return null;
        if (!map[x][y][z]) return null;
        return map[x][y][z];
    }

    export function iterateMap<T>(map: BasicMap<T>, iterateFunction: (location: MapLocation<T>) => any) {
        for (let y = map.minY; y <= map.maxY; y++) {
            for (let x = map.minX; x <= map.maxX; x++) iterateFunction(getPoint(map, x, y));
        }
    }

    export function printMap<T>(
        map: BasicMap<T>,
        getValue: (location: MapLocation<T>, x?: number, y?: number) => string,
        printIndex = false,
        spaces = true,
    ) {
        const maxLength = `${map.maxY}`.length;
        for (let y = map.minY; y <= map.maxY; y++) {
            let line = `${printIndex ? y + ' ' : ''}`;
            for (let x = map.minX; x <= map.maxX; x++)
                line += `${printIndex ? x + ' ' : ''}${getValue(getPoint(map, x, y), x, y)}${spaces ? ' ' : ''}`;
            console.log(line);
        }
    }

    export function printMap3D<T>(
        map: BasicMap3D<T>,
        getValue: (location: MapLocation3D<T>) => string,
        printIndex = false,
    ) {
        const maxLength = `${map.maxY}`.length;
        for (let z = map.minZ; z <= map.maxZ; z++) {
            console.log('z', z);
            for (let y = map.minY; y <= map.maxY; y++) {
                let line = `${printIndex ? getPrintIndex(y, maxLength) : ''}`;
                for (let x = map.minX; x <= map.maxX; x++) {
                    const location = getPoint3D(map, x, y, z);
                    line += `${getValue(location)} `;
                }
                console.log(line);
            }
        }
    }

    export function getPrintIndex(y: number, maxLength: number): string {
        let index = `${y}`;
        while (index.length < maxLength) index += ' ';
        return index;
    }

    export function getAdjacentPoints<T>(map: BasicMap<T>, x: number, y: number): MapLocation<T>[] {
        return [
            getPoint(map, x - 1, y - 1),
            getPoint(map, x - 1, y),
            getPoint(map, x - 1, y + 1),
            getPoint(map, x, y - 1),
            getPoint(map, x, y + 1),
            getPoint(map, x + 1, y - 1),
            getPoint(map, x + 1, y),
            getPoint(map, x + 1, y + 1),
        ];
    }

    export function getAdjacentPoints3D<T>(map: BasicMap3D<T>, x: number, y: number, z: number): MapLocation3D<T>[] {
        const output: MapLocation3D<T>[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    if (dx === 0 && dy === 0 && dz === 0) continue;
                    output.push(getPoint3D(map, x + dx, y + dy, z + dz));
                }
            }
        }
        return output;
    }

    export function flipMapXAxis<T>(map: BasicMap<T>): BasicMap<T> {
        const copy: BasicMap<T> = JSON.parse(JSON.stringify(map));
        const rangeX = map.maxX - map.minX;
        for (let y = map.minY; y <= map.maxY; y++) {
            for (let x = 0; x <= rangeX; x++) {
                setPointInMap(copy, map.minX + (rangeX - x), y, getPoint(map, map.minX + x, y)?.value);
            }
        }
        return copy;
    }

    export function flipMapYAxis<T>(map: BasicMap<T>): BasicMap<T> {
        const copy: BasicMap<T> = JSON.parse(JSON.stringify(map));
        const rangeY = map.maxY - map.minY;
        for (let y = 0; y <= rangeY; y++) {
            for (let x = map.minX; x <= map.maxX; x++) {
                setPointInMap(copy, x, map.minY + (rangeY - y), getPoint(map, x, map.minY + y)?.value);
            }
        }
        return copy;
    }

    export function rotateLeft<T>(map: BasicMap<T>): BasicMap<T> {
        const copy: BasicMap<T> = JSON.parse(JSON.stringify(map));
        const rangeY = map.maxY - map.minY;
        const rangeX = map.maxX - map.minX;
        for (let y = 0; y <= rangeY; y++) {
            for (let x = 0; x <= rangeX; x++) {
                setPointInMap(
                    copy,
                    map.minX + y,
                    map.minY + (rangeX - x),
                    getPoint(map, map.minX + x, map.minY + y)?.value,
                );
            }
        }
        return copy;
    }

    export function rotateRight<T>(map: BasicMap<T>): BasicMap<T> {
        const copy: BasicMap<T> = JSON.parse(JSON.stringify(map));
        const rangeY = map.maxY - map.minY;
        const rangeX = map.maxX - map.minX;
        for (let y = 0; y <= rangeY; y++) {
            for (let x = 0; x <= rangeX; x++) {
                setPointInMap(
                    copy,
                    map.minX + (rangeY - y),
                    map.minY + x,
                    getPoint(map, map.minX + x, map.minY + y)?.value,
                );
            }
        }
        return copy;
    }
}
