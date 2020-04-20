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
        if (hullPainter.currentDirection === Direction.UP) return hullPainter.currentY++;
        if (hullPainter.currentDirection === Direction.DOWN) return hullPainter.currentY--;
        if (hullPainter.currentDirection === Direction.LEFT) return hullPainter.currentX--;
        if (hullPainter.currentDirection === Direction.RIGHT) return hullPainter.currentX++;
    }

    export function getInitialHullPainter(): HullPainter {
        return {
            currentDirection: Direction.UP,
            currentX: 0,
            currentY: 0,
            differentPanelsPaintCount: 0,
            spaceShip: {}
        };
    }

    export async function runHullPainterAreaTest(program: ProgramManager): Promise<number> {
        const hullPainter = getInitialHullPainter();
        let inputAsked = false;
        program.getInput = async () => {
            inputAsked = true;
            if (!hullPainter.spaceShip[hullPainter.currentX]) hullPainter.spaceShip[hullPainter.currentX] = {};
            if (!hullPainter.spaceShip[hullPainter.currentX][hullPainter.currentY])
                hullPainter.spaceShip[hullPainter.currentX][hullPainter.currentY] = {
                    color: Color.BLACK,
                    paintedCount: 0
                };
            return hullPainter.spaceShip[hullPainter.currentX][hullPainter.currentY].color;
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
        return hullPainter.differentPanelsPaintCount;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), '../data/day_11.input'));
        const intCodes = ProgramEngine.compileProgram(lines[0]);
        const program = new ProgramManager(intCodes);

        console.log('part 1', await Day11.runHullPainterAreaTest(program));
    }

    main().catch(err => console.error(err));
}
