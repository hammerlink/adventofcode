import {ProgramManager} from "../manager/program.manager";
import {FileEngine} from "../engine/file.engine";
import {ProgramEngine} from "../engine/program.engine";

export namespace Day11 {
    export enum Direction {UP, RIGHT, DOWN, LEFT}

    export enum Color {BLACK, WHITE}

    export interface SpaceShip {
        [x: number]: {
            [y: number]: {
                color: Color;
                paintedCount: number;
            };
        };
    }

    export interface HullPainter {
        currentDirection: Direction;
        currentX: number;
        currentY: number;
        rangeX: [number, number];
        rangeY: [number, number];
        differentPanelsPaintCount: number;
        spaceShip: SpaceShip;
    }

    export function changeDirection(currentDirection: Direction, turn: number): Direction {
        const directionDelta = turn === 0 ? -1 : 1;
        const newDirection: Direction = currentDirection + directionDelta;
        if (newDirection < 0) return Direction.LEFT;
        if (newDirection > 3) return Direction.UP;
        return newDirection;
    }

    export function moveHullPainterInCurrentDirection(hullPainter: HullPainter) {
        if (hullPainter.currentDirection === Direction.UP) hullPainter.currentY++;
        if (hullPainter.currentDirection === Direction.DOWN) hullPainter.currentY--;
        if (hullPainter.currentDirection === Direction.LEFT) hullPainter.currentX--;
        if (hullPainter.currentDirection === Direction.RIGHT) hullPainter.currentX++;

        if (hullPainter.currentX < hullPainter.rangeX[0]) hullPainter.rangeX[0] = hullPainter.currentX;
        if (hullPainter.currentX > hullPainter.rangeX[1]) hullPainter.rangeX[1] = hullPainter.currentX;
        if (hullPainter.currentY > hullPainter.rangeY[1]) hullPainter.rangeY[1] = hullPainter.currentY;
        if (hullPainter.currentY < hullPainter.rangeY[0]) hullPainter.rangeY[0] = hullPainter.currentY;
    }

    export function getInitialHullPainter(): HullPainter {
        return {
            currentDirection: Direction.UP,
            currentX: 0,
            currentY: 0,
            differentPanelsPaintCount: 0,
            spaceShip: {},
            rangeX: [0, 0],
            rangeY: [0, 0],
        };
    }

    export function getCurrentColor(hullPainter: HullPainter, x?: number, y?: number) {
        if (!x && x !== 0) x = hullPainter.currentX;
        if (!y && y !== 0) y = hullPainter.currentY;
        if (!hullPainter.spaceShip[x]) hullPainter.spaceShip[x] = {};
        if (!hullPainter.spaceShip[x][y])
            hullPainter.spaceShip[x][y] = {
                color: Color.BLACK,
                paintedCount: 0
            };
        return hullPainter.spaceShip[x][y].color;
    }

    export async function runHullPainter(program: ProgramManager, hullPainter: HullPainter): Promise<HullPainter> {
        let inputAsked = false;
        program.getInput = async () => {
            inputAsked = true;
            return getCurrentColor(hullPainter);
        }
        program.writeOutput = output => {
            if (inputAsked) {
                const currentPanel = hullPainter.spaceShip[hullPainter.currentX][hullPainter.currentY];
                if (currentPanel.color !== output) {
                    if (currentPanel.paintedCount === 0) {
                        hullPainter.differentPanelsPaintCount++;
                    }
                    currentPanel.paintedCount++;
                    currentPanel.color = output;
                }
                inputAsked = false;
                return;
            }
            hullPainter.currentDirection = changeDirection(hullPainter.currentDirection, output);
            moveHullPainterInCurrentDirection(hullPainter);
        };
        await program.executeProgram();
        return hullPainter;
    }

    export async function runHullPainterAreaTest(program: ProgramManager): Promise<number> {
        const hullPainter = getInitialHullPainter();
        await runHullPainter(program, hullPainter);
        return hullPainter.differentPanelsPaintCount;
    }

    export function printHullPainterShip(hullPainter: HullPainter) {
        for (let y = hullPainter.rangeY[1]; y >= hullPainter.rangeY[0]; y--) {
            let line = '';
            for (let x = hullPainter.rangeX[0]; x <= hullPainter.rangeX[1]; x++) {
                const panelColor = getCurrentColor(hullPainter, x, y);
                line += ' ' + (panelColor === Color.BLACK ? '.' : 'O') + ' ';
            }
            console.log(line);
        }
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), '../data/day_11.input'));
        const intCodes = ProgramEngine.compileProgram(lines[0]);
        const program = new ProgramManager(intCodes);

        console.log('part 1', await Day11.runHullPainterAreaTest(program)); // 2021

        const programPart2 = new ProgramManager(intCodes);
        const hullPainter = Day11.getInitialHullPainter();
        hullPainter.spaceShip[0] = {};
        hullPainter.spaceShip[0][0] = {color: Day11.Color.WHITE, paintedCount: 0};
        await Day11.runHullPainter(programPart2, hullPainter);
        Day11.printHullPainterShip(hullPainter);
    }

    main().catch(err => console.error(err));
}
