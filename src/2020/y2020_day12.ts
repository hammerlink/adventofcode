import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day12 {
    export interface Position {
        directionAngle: number; // east = 0, north = 270, west = 180, south = 90
        x: number; // east/west
        y: number; // north/south
    }

    export interface ShipDirection {
        shipX: number;
        shipY: number;
        wayPointX: number;
        wayPointY: number;
    }

    export interface Command {
        command: string, value: number
    }

    export function parseLine(line: string): Command {
        const result = line.match(/(\D)(\d+)/);
        return {command: result[1], value: parseInt(result[2])};
    }

    export function executeCommand(position: Position, command: Command): Position {
        const output: Position = JSON.parse(JSON.stringify(position));
        let moveValue = command.command;
        if (moveValue === 'F') {
            if (position.directionAngle === 0) moveValue = 'E';
            if (position.directionAngle === 90) moveValue = 'S';
            if (position.directionAngle === 180) moveValue = 'W';
            if (position.directionAngle === 270) moveValue = 'N';
        }

        if (moveValue === 'N') output.y -= command.value;
        if (moveValue === 'S') output.y += command.value;
        if (moveValue === 'E') output.x += command.value;
        if (moveValue === 'W') output.x -= command.value;
        if (moveValue === 'L') output.directionAngle = (360 + output.directionAngle - command.value) % 360;
        if (moveValue === 'R') output.directionAngle = (360 + output.directionAngle + command.value) % 360;

        return output;
    }

    export function executeWayPointCommand(ship: Position, wayPoint: Position, command: Command): {ship: Position, wayPoint: Position} {
        const outputShip: Position = JSON.parse(JSON.stringify(ship));
        const outputWayPoint: Position = JSON.parse(JSON.stringify(wayPoint));

        let moveValue = command.command;
        if (moveValue === 'F') {
            outputShip.x += (outputWayPoint.x * command.value);
            outputShip.y += (outputWayPoint.y * command.value);
        }
        if ((moveValue === 'L' || moveValue === 'R') && command.value === 180) {
            outputWayPoint.x = -outputWayPoint.x;
            outputWayPoint.y = -outputWayPoint.y;
            return {ship: outputShip, wayPoint: outputWayPoint};
        }
        if (moveValue === 'L') {
            const {x, y} = outputWayPoint;
            if (command.value === 90) {
                outputWayPoint.x = y;
                outputWayPoint.y = -x;
            } else if (command.value === 270) {
                outputWayPoint.x = -y;
                outputWayPoint.y = x;
            } else throw new Error(`value ${command.value}`);
        }
        if (moveValue === 'R') {
            const {x, y} = outputWayPoint;
            if (command.value === 90) {
                outputWayPoint.x = -y;
                outputWayPoint.y = x;
            } else if (command.value === 270) {
                outputWayPoint.x = y;
                outputWayPoint.y = -x;
            } else throw new Error(`value ${command.value}`);
        }

        if (moveValue === 'N') outputWayPoint.y -= command.value;
        if (moveValue === 'S') outputWayPoint.y += command.value;
        if (moveValue === 'E') outputWayPoint.x += command.value;
        if (moveValue === 'W') outputWayPoint.x -= command.value;

        return {ship: outputShip, wayPoint: outputWayPoint};
    }

    export function part1(lines: string[]): number {
        const commands = lines.map(parseLine);
        let position: Position = {directionAngle: 0, x: 0, y: 0};
        commands.forEach(command => {
            position = executeCommand(position, command);
        });
        return Math.abs(position.x) + Math.abs(position.y);
    }

    export function part2(lines: string[]): number {
        const commands = lines.map(parseLine);
        let shipPosition: Position = {directionAngle: 0, x: 0, y: 0};
        let wayPointPosition: Position = {directionAngle: 0, x: 10, y: -1};
        commands.forEach(command => {
            const execution = executeWayPointCommand(shipPosition, wayPointPosition, command);
            shipPosition = execution.ship;
            wayPointPosition = execution.wayPoint;
        });
        return Math.abs(shipPosition.x) + Math.abs(shipPosition.y);
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day12.example'));

        assert.equal(Y2020_Day12.part1(exampleLines), 25, 'example 1 part 1')
        assert.equal(Y2020_Day12.part2(exampleLines), 286, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day12.input'));
        // part 1
        const part1Result = Y2020_Day12.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day12.part2(lines);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
