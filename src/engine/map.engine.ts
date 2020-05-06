export interface MapLocation<T> {
    x: number;
    y: number;
    value: T;
}

export interface BasicMap<T> {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;

    [x: number]: {
        [y: number]: MapLocation<T>;
    }
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

    export function setPointInMap<T>(map: BasicMap<T>, x: number, y: number, value: T) {
        if (!map[x]) map[x] = {};
        if (!map[x][y]) map[x][y] = {x, y, value: null};
        map[x][y].value = value;
        if (map.minX === null || x < map.minX) map.minX = x;
        if (map.maxX === null || x > map.maxX) map.maxX = x;
        if (map.minY === null || y < map.minY) map.minY = y;
        if (map.maxY === null || y > map.maxY) map.maxY = y;
    }

    export function getPoint<T>(map: BasicMap<T>, x: number, y: number): MapLocation<T> | null {
        if (!map[x]) return null;
        if (!map[x][y]) return null;
        return map[x][y];
    }
}
