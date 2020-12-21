import {ProgramManager} from "../manager/program.manager";
import {BasicMap, MapEngine} from "../engine/map.engine";

export namespace Day19 {
    export interface ScanLocation {
        value: number;
    }

    export async function scanPoint(intCode: number[], coords: [number, number]): Promise<number> {
        const program = new ProgramManager(intCode);
        let result = null;
        program.getInput = async () => {
            const value = coords.shift();
            if (value === undefined) throw new Error('no more coords');
            return value;
        };
        program.writeOutput = (value: number) => {
            result = value;
        };
        await program.executeProgram();
        return result;
    }

    export async function isPointAffected(intCode: number[], map: BasicMap<ScanLocation>, x: number, y: number): Promise<boolean> {
        let point = MapEngine.getPoint(map, x, y);
        if (!point) {
            const v = await scanPoint(intCode, [x, y]);
            point = MapEngine.setPointInMap(map, x, y, {value: v});
        }
        return point && point.value.value === 1;
    }

    export async function isSantaZone(intCode: number[], map: BasicMap<ScanLocation>, startX: number,
                                      startY: number): Promise<boolean> {
        if (! await isPointAffected(intCode, map, startX, startY)) return false;
        for (let x = startX; x < startX + 100; x++) if (! await isPointAffected(intCode, map, x, startY)) return false;
        for (let y = startY; y < startY + 100; y++) if (! await isPointAffected(intCode, map, startX, y)) return false;
        return true;
    }

    export function isSantaZoneSync(map: BasicMap<ScanLocation>, startX: number, y: number): boolean {
        for (let x = startX; x < startX + 100; x++) {
            const firstY = y + 100;
            const firstPoint = MapEngine.getPoint(map, x, firstY);
            if (!firstPoint || firstPoint.value.value === 0) return false;
            const point = MapEngine.getPoint(map, x, y);
            if (!point || point.value.value === 0) return false;
        }
        return true;
    }

    export async function scanZone(intCode: number[], xSize = 50, ySize = 50): Promise<BasicMap<ScanLocation>> {
        const map = MapEngine.newMap<ScanLocation>();
        let first = false;
        let startX, startY = null;
        for (let x = 0; x < xSize; x++) {
            if (startX) break;
            for (let y = 0; y < ySize; y++) {
                const v = await Day19.scanPoint(intCode, [x, y]);
                MapEngine.setPointInMap(map, x, y, {value: v});
                if (v === 1 && first) {
                    startX = x;
                    startY = y;
                    break;
                }
                first = true;
            }
        }
        console.log(startX, startY);
        let found = false;
        let firstX = startX;
        let lineY = startY;
        while (!found) {
            let lineX = firstX;
            let firstXSet = false;
            let previousFound = true;
            while (!firstXSet || !previousFound) {
                const isAffected = await isPointAffected(intCode, map, lineX, lineY);
                lineX++;
                if (!isAffected) continue;
                if (!firstXSet) {
                    firstXSet = true;
                    firstX = lineX - 1;
                }
                if (await isSantaZone(intCode, map, lineX, lineY)) {
                    console.log('found', lineX, lineY);
                    found = true;
                    break;
                }
            }

            lineY++;
            console.log('new line', lineY);
        }
        return map;
    }

    export async function basicScanZone(intCode: number[],
                                        startX = 0, startY = 0,
                                        xSize = 50, ySize = 50): Promise<BasicMap<ScanLocation>> {
        const map = MapEngine.newMap<ScanLocation>();
        for (let x = startX; x < startX + xSize; x++) {
            for (let y = startY; y < startY + ySize; y++) {
                const v = await Day19.scanPoint(intCode, [x, y]);
                MapEngine.setPointInMap(map, x, y, {value: v});
            }
        }
        return map;
    }
}

if (!module.parent) {
    const intCode = [109, 424, 203, 1, 21102, 11, 1, 0, 1106, 0, 282, 21101, 18, 0, 0, 1106, 0, 259, 2101, 0, 1, 221, 203, 1, 21102, 31, 1, 0, 1106, 0, 282, 21102, 1, 38, 0, 1105, 1, 259, 20102, 1, 23, 2, 22101, 0, 1, 3, 21101, 0, 1, 1, 21101, 0, 57, 0, 1106, 0, 303, 1202, 1, 1, 222, 21001, 221, 0, 3, 20102, 1, 221, 2, 21102, 259, 1, 1, 21101, 80, 0, 0, 1105, 1, 225, 21102, 1, 149, 2, 21101, 0, 91, 0, 1105, 1, 303, 1202, 1, 1, 223, 21002, 222, 1, 4, 21102, 259, 1, 3, 21102, 225, 1, 2, 21102, 225, 1, 1, 21101, 118, 0, 0, 1105, 1, 225, 20102, 1, 222, 3, 21101, 0, 127, 2, 21102, 133, 1, 0, 1105, 1, 303, 21202, 1, -1, 1, 22001, 223, 1, 1, 21102, 1, 148, 0, 1106, 0, 259, 1201, 1, 0, 223, 21001, 221, 0, 4, 21002, 222, 1, 3, 21102, 14, 1, 2, 1001, 132, -2, 224, 1002, 224, 2, 224, 1001, 224, 3, 224, 1002, 132, -1, 132, 1, 224, 132, 224, 21001, 224, 1, 1, 21101, 195, 0, 0, 106, 0, 108, 20207, 1, 223, 2, 20102, 1, 23, 1, 21101, 0, -1, 3, 21102, 214, 1, 0, 1106, 0, 303, 22101, 1, 1, 1, 204, 1, 99, 0, 0, 0, 0, 109, 5, 1202, -4, 1, 249, 22102, 1, -3, 1, 21201, -2, 0, 2, 21201, -1, 0, 3, 21102, 1, 250, 0, 1105, 1, 225, 22102, 1, 1, -4, 109, -5, 2106, 0, 0, 109, 3, 22107, 0, -2, -1, 21202, -1, 2, -1, 21201, -1, -1, -1, 22202, -1, -2, -2, 109, -3, 2105, 1, 0, 109, 3, 21207, -2, 0, -1, 1206, -1, 294, 104, 0, 99, 21202, -2, 1, -2, 109, -3, 2106, 0, 0, 109, 5, 22207, -3, -4, -1, 1206, -1, 346, 22201, -4, -3, -4, 21202, -3, -1, -1, 22201, -4, -1, 2, 21202, 2, -1, -1, 22201, -4, -1, 1, 22101, 0, -2, 3, 21101, 343, 0, 0, 1106, 0, 303, 1106, 0, 415, 22207, -2, -3, -1, 1206, -1, 387, 22201, -3, -2, -3, 21202, -2, -1, -1, 22201, -3, -1, 3, 21202, 3, -1, -1, 22201, -3, -1, 2, 22101, 0, -4, 1, 21102, 1, 384, 0, 1106, 0, 303, 1105, 1, 415, 21202, -4, -1, -4, 22201, -4, -3, -4, 22202, -3, -2, -2, 22202, -2, -4, -4, 22202, -3, -2, -3, 21202, -4, -1, -2, 22201, -3, -2, 1, 22102, 1, 1, -4, 109, -5, 2106, 0, 0];


    async function main() {
        // part 1
        // let count = 0;
        // for (let x = 0; x < 50; x++) {
        //     for (let y = 0; y < 50; y++) {
        //         if ((await Day19.scanPoint(intCode, [x, y])) === 1) count++;
        //     }
        // }
        // console.log('part 1', count);
        // 112



        const map = await Day19.basicScanZone(intCode, 1600, 1800, 400, 500);
        const fs = require('fs');
        map.minX = 1600;
        map.minY = 1800;

        console.log('map made');

        for (let y = map.minY; y < map.maxY; y++) {
            for (let x = map.minX; x < map.maxX; x++) {
                if (Day19.isSantaZoneSync(map, x, y)) {
                    console.log('santa zone', x, y, x*x + y*y);
                }
            }
        }
        // const map: BasicMap<Day19.ScanLocation> = JSON.parse(fs.readFileSync('./day_19.json').toString());
        // fs.writeFileSync('./day_19.json', JSON.stringify(map, null, 4))

        // santa zone 1833 1989
        // santa zone 1834 1990
        // santa zone 1835 1991
        // santa zone 1836 1992
        // santa zone 1837 1993
        // santa zone 1840 1997


        // MapEngine.printMap(map, location => {
        //     if (!location) return ' ';
        //     return location.value.value === 1 ? 'X' : '.';
        // }, true);

        console.log(Day19.isSantaZoneSync(map, 1840, 2097));
        // 1840, 1997 too high

        // every 9 y lines, a new point is added left
        // every 36 y lines, a point is removed right
        // all points are continued with x+1, y+1
        // 100 - 104

        // 18331989 to high
    }

    main().catch(console.log);
}
