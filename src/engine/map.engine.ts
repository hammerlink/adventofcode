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

    export function setPointInMap<T>(map: BasicMap<T>, x: number, y: number, value: T): MapLocation<T> {
        if (!map[x]) map[x] = {};
        if (!map[x][y]) map[x][y] = {x, y, value: null};
        map[x][y].value = value;
        if (map.minX === null || x < map.minX) map.minX = x;
        if (map.maxX === null || x > map.maxX) map.maxX = x;
        if (map.minY === null || y < map.minY) map.minY = y;
        if (map.maxY === null || y > map.maxY) map.maxY = y;
        return map[x][y];
    }

    export function getPoint<T>(map: BasicMap<T>, x: number, y: number): MapLocation<T> | null {
        if (!map[x]) return null;
        if (!map[x][y]) return null;
        return map[x][y];
    }

    export function printMap<T>(map: BasicMap<T>, getValue: (location: MapLocation<T>) => string, printIndex = false) {
        const maxLength = `${map.maxY}`.length;
        for (let y = map.minY; y <= map.maxY; y++) {
            let line = `${printIndex ? getPrintIndex(y, maxLength): ''}`;
            for (let x = map.minX; x <= map.maxX; x++) line += `${getValue(map[x][y])} `;
            console.log(line);
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
}
