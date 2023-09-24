import {FileEngine} from '../engine/file.engine';
import {BasicMap, MapEngine} from '../engine/map.engine';

export namespace Y2020_Day3 {
    export interface TobogganPoint {
        tree: boolean;
    }

    // add map to the right again

    export function repeatMap(map: BasicMap<Y2020_Day3.TobogganPoint>, mapPattern: BasicMap<Y2020_Day3.TobogganPoint>) {
        const startPoint = map.maxX + 1;
        for (let x = mapPattern.minX; x <= mapPattern.maxX; x++) {
            for (let y = mapPattern.minY; y <= mapPattern.maxY; y++) {
                MapEngine.setPointInMap(map, startPoint + x, y, {tree: mapPattern[x][y].value.tree});
            }
        }
    }

    export function stepDownSlope(mapTemplate: BasicMap<Y2020_Day3.TobogganPoint>, xStep: number, yStep: number): number {
        const map: BasicMap<Y2020_Day3.TobogganPoint> = JSON.parse(JSON.stringify(mapTemplate));
        let treeCount = 0;
        let y = 0;
        let x = 0;
        while (y < map.maxY) {
            y += yStep;
            x += xStep;
            let point = MapEngine.getPoint(map, x, y);
            if (!point) {
                repeatMap(map, mapTemplate);
                point = MapEngine.getPoint(map, x, y);
                if (point === null) {
                    const x = true;
                }
            }
            if (point && point.value.tree) treeCount++;
        }
        return treeCount;
    }

    export function simpleStepDownSlope(lines: string[], stepX: number, stepY: number): number {
        let treeCount = 0;
        const defaultLength = lines[0].length;
        let x = 0;
        for (let i = 0; i < lines.length; i = i + stepY) {
            const parsedX = x % defaultLength;
            if (lines[i][parsedX] === '#') treeCount++;
            x += stepX;
        }
        return treeCount;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const startMs = Date.now();
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day3.input'));
        const originalMap = MapEngine.newMap<Y2020_Day3.TobogganPoint>();
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                MapEngine.setPointInMap(originalMap, x, y, {tree: line[x] === '#'});
            }
        }
        console.log('map created', Date.now() - startMs, 'ms');
        console.log(Y2020_Day3.stepDownSlope(originalMap, 3, 1));
        console.log(Y2020_Day3.simpleStepDownSlope(lines, 3, 1));

        console.log([
            Y2020_Day3.stepDownSlope(originalMap, 1, 1),
            Y2020_Day3.stepDownSlope(originalMap, 3, 1),
            Y2020_Day3.stepDownSlope(originalMap, 5, 1),
            Y2020_Day3.stepDownSlope(originalMap, 7, 1),
            Y2020_Day3.stepDownSlope(originalMap, 1, 2),
        ].reduce((total, value) => total * value));
        console.log('multi slope', Date.now() - startMs, 'ms');

        const part2Result = [[1, 1], [3, 1], [5, 1], [7, 1], [1, 2]]
            .map(v => Y2020_Day3.simpleStepDownSlope(lines, v[0], v[1]))
            .reduce((t, v) => t * v);
        console.log(part2Result)
        console.log(Date.now() - startMs, 'ms');
    }

    main().catch(err => console.error(err));

}
