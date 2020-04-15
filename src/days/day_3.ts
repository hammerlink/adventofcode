export namespace Day3 {
    export interface Position {x: number; y: number;}
    export interface DynamicPosition extends Position {steps: number}
    export interface Cell extends Position {lines: {[lineKey: string]: number};}
    export interface Movement {direction: string, amount: number}
    export interface Field {raster: {[x: string]: {[y: string]: Cell}}, intersections: Cell[],
        max: Position, min: Position}

    export function parseRawMovementLine(line: string): string[] {
        return line.split(',');
    }

    export function parseMovement(movement: string): Movement {
        return {
            direction: movement[0],
            amount: parseInt(movement.substr(1), 10),
        };
    }

    export function setLineInRaster(field: Field, currentX: number, currentY: number, lineKey: string, steps: number) {
        const raster = field.raster;
        if (currentX < field.min.x) field.min.x = currentX;
        if (currentX > field.max.x) field.max.x = currentX;
        if (currentY < field.min.y) field.min.y = currentY;
        if (currentY > field.max.y) field.max.y = currentY;
        if (!raster[currentX]) raster[currentX] = {};
        if (!raster[currentX][currentY]) raster[currentX][currentY] = {x: currentX, y: currentY, lines: {}};
        const currentCell = raster[currentX][currentY];
        if (Object.keys(currentCell.lines).length > 0 && field.intersections.indexOf(currentCell) === -1) {
            field.intersections.push(currentCell);
        }
        if (!currentCell.lines[lineKey]) {
            currentCell.lines[lineKey] = steps;
        }
    }

    export function executeMovement(field: Field, position: DynamicPosition, movement: Movement, lineKey: string): DynamicPosition {
        if (movement.direction === 'U') {
            for (let i = 1; i <= movement.amount; i++) setLineInRaster(field, position.x, position.y + i, lineKey, position.steps + i);
            return {x: position.x, y: position.y + movement.amount, steps: position.steps + movement.amount};
        }
        if (movement.direction === 'D') {
            for (let i = 1; i <= movement.amount; i++) setLineInRaster(field, position.x, position.y - i, lineKey, position.steps + i);
            return  {x: position.x, y: position.y - movement.amount, steps: position.steps + movement.amount};
        }
        if (movement.direction === 'L') {
            for (let i = 1; i <= movement.amount; i++) setLineInRaster(field, position.x - i, position.y, lineKey, position.steps + i);
            return  {x: position.x - movement.amount, y: position.y, steps: position.steps + movement.amount};
        }
        if (movement.direction === 'R') {
            for (let i = 1; i <= movement.amount; i++) setLineInRaster(field, position.x + i, position.y, lineKey, position.steps + i);
            return  {x: position.x + movement.amount, y: position.y, steps: position.steps + movement.amount};
        }
    }

    export function getDistance(cell: Cell) {
        return Math.abs(cell.x) + Math.abs(cell.y);
    }

    export function getClosestIntersection(lineMovements: Movement[][]): number {
        const field: Day3.Field = {
            intersections: [],
            raster: {},
            max: {x: 0, y: 0},
            min: {x: 0, y: 0},
        };
        for (let i = 0; i < lineMovements.length; i++) {
            const lineMovement = lineMovements[i];
            const lineKey = '' + (i + 1);
            let position: DynamicPosition = {x: 0, y: 0, steps: 0};
            lineMovement.forEach(movement => {
                position = Day3.executeMovement(field, position, movement, lineKey);
            });
        }
        return calculateFastestIntersection(field);
    }

    export function calculateFastestIntersection(field: Field): number {
        let fastestIntersection: number = null;
        field.intersections.forEach(intersection => {
            if (Object.keys(intersection.lines).length < 2) return;
            let distance = 0;
            for (const key in intersection.lines) distance += intersection.lines[key];
            if (fastestIntersection === null || distance < fastestIntersection) fastestIntersection = distance;
        });
        return fastestIntersection;
    }

    export function calculateClosestIntersection(field: Field): number {
        let closestIntersection: number = null;
        field.intersections.forEach(intersection => {
            if (Object.keys(intersection.lines).length < 2) return;
            const distance = Day3.getDistance(intersection);
            if (closestIntersection === null || distance < closestIntersection) closestIntersection = distance;
        });
        return closestIntersection;
    }

    export function getClosestIntersectionFromRawLines(lines: string[]): number {
        return getClosestIntersection(lines.map(line => parseRawMovementLine(line).map(parseMovement)));
    }

    export function printRaster(field: Field) {
        const raster = field.raster;
        for (let y = field.max.y + 1; y >= field.min.y - 1; y--) {
            let line = '';
            for (let x = field.min.x - 1; x <= field.max.x + 1; x++) {
                const lines = raster[x]?.[y]?.lines;
                const count = lines && Object.keys(lines).length ?
                    Object.keys(lines).length > 1 ? 'x' : Object.keys(lines)[0]
                    : '.';
                line += `${count} `;
            }
            console.log(line);
        }
    }
}

if (!module.parent) {
    // console.log(Day3.getClosestIntersectionFromRawLines([
    //     'L8,D5,R5,U3',
    //     'D7,L6,U4,R4',
    // ]));
    console.log(Day3.getClosestIntersectionFromRawLines([
        'R8,U5,L5,D3',
        'U7,R6,D4,L4',
    ]));

    // process.exit(0);
    console.log(Day3.getClosestIntersectionFromRawLines([
        'R75,D30,R83,U83,L12,D49,R71,U7,L72',
        'U62,R66,U55,R34,D71,R55,D58,R83',
    ]));
    console.log(Day3.getClosestIntersectionFromRawLines([
        'R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51',
        'U98,R91,D20,R16,D67,R40,U7,R15,U6,R7',
    ]));

    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_3.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        const lines: string[] = [];
        for await (const line of rl) {
            if (!line) return;
            lines.push(line)
        }

        console.log(Day3.getClosestIntersectionFromRawLines(lines));

    }

    main().then(console.log).catch(err => console.error(err));
}
