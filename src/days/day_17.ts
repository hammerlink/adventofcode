import {ProgramManager} from "../manager/program.manager";
import {BasicMap, MapEngine, MapLocation} from "../engine/map.engine";

export namespace Day17 {
    export enum MapPointType {
        SCAFFOLD = 35, OPEN_SPACE = 46,
        CAMERA_LEFT = 60, CAMERA_RIGHT = 62, CAMERA_UP = 94, CAMERA_DOWN = 118, CAMERA_FALLING = 88
    }

    export enum Direction {
        UP, LEFT, DOWN, RIGHT
    }

    export interface AsciiMapLocation {
        value: MapPointType;
        isScaffold?: boolean;
        isStartPoint?: boolean;
        isEndPoint?: boolean;
        patterns?: {
            [direction: string]: {}
        };
        mark?: string;
    }

    export interface Sequence { sequence: string, patterns: string[] }

    export interface VacuumBotInstructions {
        routine: number[];
        A: number[];
        B: number[];
        C: number[];
    }

    export class AsciiBot extends ProgramManager {
        map: BasicMap<AsciiMapLocation> = MapEngine.newMap<AsciiMapLocation>();
        currentX = 0;
        currentY = 0;

        cameraPosition: MapLocation<AsciiMapLocation>;

        commands: number[] = [];

        line = '';

        getInput = async () => {
            if (this.commands.length) {
                return this.commands.shift();
            }
        }

        writeOutput = (output) => {
            if (output === 10) return this.writeLine();
            this.line += String.fromCharCode(output);
            const location: AsciiMapLocation = {
                value: output,
                isScaffold: output !== MapPointType.OPEN_SPACE && output !== MapPointType.CAMERA_FALLING
            };
            if (isCamera(output)) {
                this.cameraPosition = {
                    value: location,
                    x: this.currentX,
                    y: this.currentY,
                };
            }
            MapEngine.setPointInMap(this.map, this.currentX, this.currentY, location);
            this.currentX++;
        };

        writeLine() {
            // console.log(this.line);
            this.line = '';
            this.currentY++;
            this.currentX = 0;
        }
    }

    // find 3 movement functions of each 20 commands max, with which you can parcour through the entire map
    // R,8,R,8,R,4,R,4,R,8,L,6,L,2,R,4,R,4,R,8,R,8,R,8,L,6,L,2
    // determine all possible paths
    // 1 solution is sufficient

    export function isCamera(value: number): boolean {
        return value === MapPointType.CAMERA_UP || value === MapPointType.CAMERA_RIGHT
            || value === MapPointType.CAMERA_LEFT || value === MapPointType.CAMERA_DOWN;
    }

    export function getSumOfAlignmentParameters(map: BasicMap<AsciiMapLocation>): number {
        let output = 0;
        let count = 0;
        // get all alignment parameters
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                const location = MapEngine.getPoint(map, x, y);
                if (!location?.value.isScaffold) continue;
                if (isIntersection(location, map)) {
                    count++;
                    output += calculateAlignmentParameter(location);
                }
                // check if it is a crossing
            }
        }
        return output;
    }

    export function isIntersection(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>): boolean {
        const x = location.x;
        const y = location.y;
        return MapEngine.getPoint(map, x + 1, y)?.value.isScaffold
            && MapEngine.getPoint(map, x - 1, y)?.value.isScaffold
            && MapEngine.getPoint(map, x, y + 1)?.value.isScaffold
            && MapEngine.getPoint(map, x, y - 1)?.value.isScaffold;
    }

    // this loads all start points on map, must be executed after getting the map
    export function getBotStartPoints(map: BasicMap<AsciiMapLocation>): MapLocation<AsciiMapLocation>[] {
        const points: MapLocation<AsciiMapLocation>[] = [];
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                const location = MapEngine.getPoint(map, x, y);
                if (!location?.value.isScaffold) continue;
                if (isStartPoint(location, map)) {
                    points.push(location);
                    location.value.isStartPoint = true;
                }
            }
        }
        return points;
    }

    export function isStartPoint(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>): boolean {
        const x = location.x;
        const y = location.y;
        let count = 0;

        if (isCamera(location.value.value)) return true;

        if (MapEngine.getPoint(map, x + 1, y)?.value.isScaffold
            || MapEngine.getPoint(map, x - 1, y)?.value.isScaffold) count++;
        if (MapEngine.getPoint(map, x, y + 1)?.value.isScaffold
            || MapEngine.getPoint(map, x, y - 1)?.value.isScaffold) count++;

        return count > 1;
    }

    export function getEndPoints(map: BasicMap<AsciiMapLocation>): MapLocation<AsciiMapLocation>[] {
        const points: MapLocation<AsciiMapLocation>[] = [];
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                const location = MapEngine.getPoint(map, x, y);
                if (!location?.value.isScaffold) continue;
                if (isEndPoint(location, map)) {
                    points.push(location);
                    location.value.isEndPoint = true;
                }
            }
        }
        return points;
    }

    export function isEndPoint(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>): boolean {
        const x = location.x;
        const y = location.y;
        let count = 0;
        if (MapEngine.getPoint(map, x + 1, y)?.value.isScaffold) count++;
        if (MapEngine.getPoint(map, x - 1, y)?.value.isScaffold) count++;
        if (MapEngine.getPoint(map, x, y + 1)?.value.isScaffold) count++;
        if (MapEngine.getPoint(map, x, y - 1)?.value.isScaffold) count++;
        return count === 1;
    }

    export function calculateAlignmentParameter<T>(location: MapLocation<T>): number {
        return location.x * location.y;
    }

    export function validateSequence(sequence: Sequence, map: BasicMap<AsciiMapLocation>,
                                     startLocation: MapLocation<AsciiMapLocation>, startDirection: Direction): boolean {
        const inputMap: BasicMap<AsciiMapLocation> = JSON.parse(JSON.stringify(map));
        let currentLocation = startLocation;
        currentLocation.value.mark = 'A'; // start
        let currentDirection = startDirection;
        const patterns = sequence.sequence.split(',');
        patterns.forEach(sequenceValue => {
            const index = sequenceValue.charCodeAt(0) - 65;
            const pattern = sequence.patterns[index];
            const result = executePatternAndMark(currentLocation, inputMap, currentDirection, pattern, sequenceValue);
            currentDirection = result.direction;
            currentLocation = result.location;
        });
        console.log();
        MapEngine.printMap(inputMap, (location) => {
            if (location.value.mark) return location.value.mark;
            return String.fromCharCode(location.value.value);
        });
        for (let x = map.minX; x <= map.maxX; x++) {
            for (let y = map.minY; y <= map.maxY; y++) {
                const location = MapEngine.getPoint(inputMap, x, y);
                if (location.value.isScaffold && !location.value.mark &&
                    (location.x !== startLocation.x && location.y !== startLocation.y)) {
                    return false;
                }
            }
        }
        return true;
    }

    export function searchPatternSequence(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>,
                                          direction: Direction, sequence: string, patterns: string[],
                                          endLocation: MapLocation<AsciiMapLocation>,
                                          startLocation: MapLocation<AsciiMapLocation>, startDirection: Direction,
                                          cache: string[] = [], count = 0): Sequence {
        if (!location) return;
        const id = `${location.x};${location.y};${direction}`;
        if (cache.indexOf(id) > -1) return;
        if (location === endLocation ) {
            // check if all scaffolds are passed
            if (sequence.length <= 20) {
                if (validateSequence({sequence, patterns}, map, startLocation, startDirection))
                    return {sequence, patterns};
            }
        }
        if (location.y >= 19 && count < 125) return;
        if (sequence.length >= 20) return;
        if (!location.value.patterns) buildAllPatterns(location, map);
        const possiblePatterns = location?.value?.patterns[direction];
        const canUseNextPattern = patterns.length < 3;
        for (const pattern in possiblePatterns) {
            const patternIndex = patterns.indexOf(pattern); // 65
            if (patternIndex > -1) {
                const newLocation = executePattern(location, map, direction, pattern);
                const result = searchPatternSequence(newLocation.location, map, newLocation.direction, addToPattern(sequence,
                    String.fromCharCode(patternIndex + 65)), patterns, endLocation, startLocation, startDirection,
                    [...cache, id], count + newLocation.count);
                if (result) return result;
            } else if (canUseNextPattern) {
                const newPatterns = [...patterns, pattern];
                const newLocation = executePattern(location, map, direction, pattern);
                const result = searchPatternSequence(newLocation.location, map, newLocation.direction, addToPattern(sequence,
                    String.fromCharCode(newPatterns.length - 1 + 65)), newPatterns, endLocation, startLocation, startDirection,
                    [...cache, id], count + newLocation.count);
                if (result) return result;
            }
        }
        return;
    }

    export function executePattern(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>,
                                   direction: Direction, pattern: string): {location: MapLocation<AsciiMapLocation>,
        direction: Direction, count: number} {
        const commands = pattern.split(',');
        let currentDirection = direction;
        let currentLocation = location;
        let count = 0;
        commands.forEach(c => {
            if (c === 'L') currentDirection = turnLeft(currentDirection);
            else if (c === 'R') currentDirection = turnRight(currentDirection);
            else {
                const steps = parseInt(c, 10);
                count += steps;
                currentLocation = moveInDirection(currentLocation, map, currentDirection, steps);
            }
        })
        return {location: currentLocation, direction: currentDirection, count};
    }

    export function markPatternAndPrint(map: BasicMap<AsciiMapLocation>, pattern: string, mark: string, print = false) {
        const startPoints = getBotStartPoints(map);
        startPoints.forEach(p => {
            for (const direction in p.value.patterns) {
                const patterns = p.value.patterns[direction];
                if (patterns[pattern]) executePatternAndMark(p, map, parseInt(direction, 10), pattern, mark);
            }
        });
        if (print) MapEngine.printMap(map, (location) => {
            if (location.value.mark) return location.value.mark;
            return String.fromCharCode(location.value.value);
        });
    }

    export function executePatternAndMark(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>,
                                   direction: Direction, pattern: string, mark: string): {location: MapLocation<AsciiMapLocation>,
        direction: Direction, count: number} {
        const commands = pattern.split(',');
        let currentDirection = direction;
        let currentLocation = location;
        let count = 0;
        commands.forEach(c => {
            if (c === 'L') currentDirection = turnLeft(currentDirection);
            else if (c === 'R') currentDirection = turnRight(currentDirection);
            else {
                const steps = parseInt(c, 10);
                count += steps;
                for (let i = 0; i < steps; i++) {
                    currentLocation = moveInDirection(currentLocation, map, currentDirection);
                    currentLocation.value.mark = mark;
                }
            }
        })
        return {location: currentLocation, direction: currentDirection, count};
    }

    export function buildAllPatterns(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>) {
        const directions = [0,1,2,3];
        directions.forEach(d => {
            const patternCache: { [pattern: string]: boolean } = {};
            buildPattern(location, map, '', d, patternCache);
            if (!location.value.patterns) location.value.patterns = {};
            location.value.patterns[d] = patternCache;
        });
    }

    function addToPattern(pattern: string, newPiece: string): string {
        return `${pattern}${pattern.length > 0 ? ',' : ''}${newPiece}`;
    }

    export function buildPattern(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>, pattern: string,
                                 direction: Direction, patternCache: { [pattern: string]: boolean }, lastType?: string,
                                 cache: string[] = []) {
        if (pattern.length >= 20) {
            let output = pattern;
            if (pattern.length > 20) { // strip last piece in case of larger
                while (output.length > 20) output = output.substring(0, output.lastIndexOf(','));
            }
            patternCache[output] = true;
            return;
        } else if (pattern.length > 1) {
            patternCache[pattern] = true;
        }


        const id = `${location.x};${location.y};${direction}`;
        // if (cache.indexOf(id) > -1) return;
        // try move
        const currentMovementOptions = getMovementOptions(location, map, direction);
        if (lastType !== 'm') currentMovementOptions
            .forEach(x => buildPattern(
                moveInDirection(location, map, direction, x),
                map, addToPattern(pattern, `${x}`), direction, patternCache, 'm', cache));

        const availableDirections = getAvailableDirections(location, map);
        // try left
        const leftDirection = turnLeft(direction);
        if (lastType !== 'd' && availableDirections.indexOf(leftDirection) > -1)
        // if (availableDirections.indexOf(leftDirection) > -1)
            buildPattern(location, map, addToPattern(pattern, 'L'), leftDirection, patternCache, 'd', cache);
        // try right
        const rightDirection = turnRight(direction);
        if (lastType !== 'd' && availableDirections.indexOf(rightDirection) > -1)
        // if (availableDirections.indexOf(rightDirection) > -1)
            buildPattern(location, map, addToPattern(pattern, 'R'), rightDirection, patternCache, 'd', cache);
    }

    export function getMovementOptions(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>,
                                       direction: Direction): number[] {
        const distances: number[] = [];
        let nextLocation = moveInDirection(location, map, direction, 1);
        let currentSteps = 1;
        while (nextLocation?.value?.isScaffold) {
            if (nextLocation.value.isStartPoint || currentSteps % 2 === 0 ) distances.push(currentSteps);
            nextLocation = moveInDirection(nextLocation, map, direction, 1);
            currentSteps++;
        }
        return distances;
    }

    export function moveInDirection(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>,
                                    direction: Direction, steps = 1): MapLocation<AsciiMapLocation> {
        // y 0 is top, n is bottom
        if (direction === Direction.UP) return MapEngine.getPoint(map, location.x, location.y - steps);
        if (direction === Direction.DOWN) return MapEngine.getPoint(map, location.x, location.y + steps);
        if (direction === Direction.LEFT) return MapEngine.getPoint(map, location.x - steps, location.y);
        if (direction === Direction.RIGHT) return MapEngine.getPoint(map, location.x + steps, location.y);
        return location;
    }

    export function getEntryDirections(location: MapLocation<AsciiMapLocation>, map: BasicMap<AsciiMapLocation>): Direction[] {
        const directions: Direction[] = [];
        const directionMap: {} = {};
        const addDirection = (d: Direction) => {
            if (!directionMap[d]) {
                directions.push(d);
                directionMap[d] = true;
            }
        };
        const value = location.value.value;
        if (value === MapPointType.CAMERA_UP) addDirection(Direction.UP);
        if (value === MapPointType.CAMERA_DOWN) addDirection(Direction.DOWN);
        if (value === MapPointType.CAMERA_LEFT) addDirection(Direction.LEFT);
        if (value === MapPointType.CAMERA_RIGHT) addDirection(Direction.RIGHT);

        if (moveInDirection(location, map, Direction.UP, 1)?.value.isScaffold) addDirection(Direction.DOWN);
        if (moveInDirection(location, map, Direction.DOWN, 1)?.value.isScaffold) addDirection(Direction.UP);
        if (moveInDirection(location, map, Direction.LEFT, 1)?.value.isScaffold) addDirection(Direction.RIGHT);
        if (moveInDirection(location, map, Direction.RIGHT, 1)?.value.isScaffold) addDirection(Direction.LEFT);
        return directions;
    }

    export function getAvailableDirections(location: MapLocation<AsciiMapLocation>,
                                           map: BasicMap<AsciiMapLocation>): Direction[] {
        const directions: Direction[] = [];
        if (moveInDirection(location, map, Direction.UP, 1)?.value.isScaffold) directions.push(Direction.UP);
        if (moveInDirection(location, map, Direction.LEFT, 1)?.value.isScaffold) directions.push(Direction.LEFT);
        if (moveInDirection(location, map, Direction.DOWN, 1)?.value.isScaffold) directions.push(Direction.DOWN);
        if (moveInDirection(location, map, Direction.RIGHT, 1)?.value.isScaffold) directions.push(Direction.RIGHT);
        return directions;
    }

    export function turnRight(direction: Direction): Direction {
        if (direction === 0) return Direction.RIGHT;
        return direction - 1;
    }

    export function turnLeft(direction: Direction): Direction {
        if (direction === Direction.RIGHT) return Direction.UP;
        return direction + 1;
    }
}

if (!module.parent) {
    const intCode = [1, 330, 331, 332, 109, 3300, 1102, 1182, 1, 15, 1101, 1455, 0, 24, 1002, 0, 1, 570, 1006, 570, 36, 101, 0, 571, 0, 1001, 570, -1, 570, 1001, 24, 1, 24, 1106, 0, 18, 1008, 571, 0, 571, 1001, 15, 1, 15, 1008, 15, 1455, 570, 1006, 570, 14, 21102, 58, 1, 0, 1106, 0, 786, 1006, 332, 62, 99, 21101, 333, 0, 1, 21102, 1, 73, 0, 1105, 1, 579, 1101, 0, 0, 572, 1101, 0, 0, 573, 3, 574, 101, 1, 573, 573, 1007, 574, 65, 570, 1005, 570, 151, 107, 67, 574, 570, 1005, 570, 151, 1001, 574, -64, 574, 1002, 574, -1, 574, 1001, 572, 1, 572, 1007, 572, 11, 570, 1006, 570, 165, 101, 1182, 572, 127, 102, 1, 574, 0, 3, 574, 101, 1, 573, 573, 1008, 574, 10, 570, 1005, 570, 189, 1008, 574, 44, 570, 1006, 570, 158, 1106, 0, 81, 21101, 0, 340, 1, 1105, 1, 177, 21101, 477, 0, 1, 1105, 1, 177, 21102, 1, 514, 1, 21101, 176, 0, 0, 1106, 0, 579, 99, 21101, 0, 184, 0, 1105, 1, 579, 4, 574, 104, 10, 99, 1007, 573, 22, 570, 1006, 570, 165, 101, 0, 572, 1182, 21101, 0, 375, 1, 21102, 211, 1, 0, 1106, 0, 579, 21101, 1182, 11, 1, 21102, 222, 1, 0, 1106, 0, 979, 21102, 1, 388, 1, 21102, 1, 233, 0, 1106, 0, 579, 21101, 1182, 22, 1, 21102, 1, 244, 0, 1106, 0, 979, 21101, 0, 401, 1, 21102, 255, 1, 0, 1106, 0, 579, 21101, 1182, 33, 1, 21101, 0, 266, 0, 1106, 0, 979, 21102, 1, 414, 1, 21101, 277, 0, 0, 1106, 0, 579, 3, 575, 1008, 575, 89, 570, 1008, 575, 121, 575, 1, 575, 570, 575, 3, 574, 1008, 574, 10, 570, 1006, 570, 291, 104, 10, 21101, 1182, 0, 1, 21101, 313, 0, 0, 1105, 1, 622, 1005, 575, 327, 1101, 0, 1, 575, 21102, 327, 1, 0, 1106, 0, 786, 4, 438, 99, 0, 1, 1, 6, 77, 97, 105, 110, 58, 10, 33, 10, 69, 120, 112, 101, 99, 116, 101, 100, 32, 102, 117, 110, 99, 116, 105, 111, 110, 32, 110, 97, 109, 101, 32, 98, 117, 116, 32, 103, 111, 116, 58, 32, 0, 12, 70, 117, 110, 99, 116, 105, 111, 110, 32, 65, 58, 10, 12, 70, 117, 110, 99, 116, 105, 111, 110, 32, 66, 58, 10, 12, 70, 117, 110, 99, 116, 105, 111, 110, 32, 67, 58, 10, 23, 67, 111, 110, 116, 105, 110, 117, 111, 117, 115, 32, 118, 105, 100, 101, 111, 32, 102, 101, 101, 100, 63, 10, 0, 37, 10, 69, 120, 112, 101, 99, 116, 101, 100, 32, 82, 44, 32, 76, 44, 32, 111, 114, 32, 100, 105, 115, 116, 97, 110, 99, 101, 32, 98, 117, 116, 32, 103, 111, 116, 58, 32, 36, 10, 69, 120, 112, 101, 99, 116, 101, 100, 32, 99, 111, 109, 109, 97, 32, 111, 114, 32, 110, 101, 119, 108, 105, 110, 101, 32, 98, 117, 116, 32, 103, 111, 116, 58, 32, 43, 10, 68, 101, 102, 105, 110, 105, 116, 105, 111, 110, 115, 32, 109, 97, 121, 32, 98, 101, 32, 97, 116, 32, 109, 111, 115, 116, 32, 50, 48, 32, 99, 104, 97, 114, 97, 99, 116, 101, 114, 115, 33, 10, 94, 62, 118, 60, 0, 1, 0, -1, -1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 44, 2, 0, 109, 4, 2101, 0, -3, 587, 20101, 0, 0, -1, 22101, 1, -3, -3, 21102, 1, 0, -2, 2208, -2, -1, 570, 1005, 570, 617, 2201, -3, -2, 609, 4, 0, 21201, -2, 1, -2, 1105, 1, 597, 109, -4, 2105, 1, 0, 109, 5, 2101, 0, -4, 630, 20102, 1, 0, -2, 22101, 1, -4, -4, 21101, 0, 0, -3, 2208, -3, -2, 570, 1005, 570, 781, 2201, -4, -3, 652, 21002, 0, 1, -1, 1208, -1, -4, 570, 1005, 570, 709, 1208, -1, -5, 570, 1005, 570, 734, 1207, -1, 0, 570, 1005, 570, 759, 1206, -1, 774, 1001, 578, 562, 684, 1, 0, 576, 576, 1001, 578, 566, 692, 1, 0, 577, 577, 21101, 0, 702, 0, 1105, 1, 786, 21201, -1, -1, -1, 1105, 1, 676, 1001, 578, 1, 578, 1008, 578, 4, 570, 1006, 570, 724, 1001, 578, -4, 578, 21102, 1, 731, 0, 1105, 1, 786, 1106, 0, 774, 1001, 578, -1, 578, 1008, 578, -1, 570, 1006, 570, 749, 1001, 578, 4, 578, 21101, 0, 756, 0, 1105, 1, 786, 1105, 1, 774, 21202, -1, -11, 1, 22101, 1182, 1, 1, 21102, 1, 774, 0, 1105, 1, 622, 21201, -3, 1, -3, 1105, 1, 640, 109, -5, 2106, 0, 0, 109, 7, 1005, 575, 802, 20101, 0, 576, -6, 21001, 577, 0, -5, 1105, 1, 814, 21102, 0, 1, -1, 21102, 1, 0, -5, 21101, 0, 0, -6, 20208, -6, 576, -2, 208, -5, 577, 570, 22002, 570, -2, -2, 21202, -5, 45, -3, 22201, -6, -3, -3, 22101, 1455, -3, -3, 1202, -3, 1, 843, 1005, 0, 863, 21202, -2, 42, -4, 22101, 46, -4, -4, 1206, -2, 924, 21101, 1, 0, -1, 1106, 0, 924, 1205, -2, 873, 21101, 35, 0, -4, 1105, 1, 924, 2101, 0, -3, 878, 1008, 0, 1, 570, 1006, 570, 916, 1001, 374, 1, 374, 2101, 0, -3, 895, 1102, 2, 1, 0, 1202, -3, 1, 902, 1001, 438, 0, 438, 2202, -6, -5, 570, 1, 570, 374, 570, 1, 570, 438, 438, 1001, 578, 558, 921, 21001, 0, 0, -4, 1006, 575, 959, 204, -4, 22101, 1, -6, -6, 1208, -6, 45, 570, 1006, 570, 814, 104, 10, 22101, 1, -5, -5, 1208, -5, 41, 570, 1006, 570, 810, 104, 10, 1206, -1, 974, 99, 1206, -1, 974, 1102, 1, 1, 575, 21102, 973, 1, 0, 1105, 1, 786, 99, 109, -7, 2106, 0, 0, 109, 6, 21101, 0, 0, -4, 21102, 0, 1, -3, 203, -2, 22101, 1, -3, -3, 21208, -2, 82, -1, 1205, -1, 1030, 21208, -2, 76, -1, 1205, -1, 1037, 21207, -2, 48, -1, 1205, -1, 1124, 22107, 57, -2, -1, 1205, -1, 1124, 21201, -2, -48, -2, 1106, 0, 1041, 21101, 0, -4, -2, 1105, 1, 1041, 21102, 1, -5, -2, 21201, -4, 1, -4, 21207, -4, 11, -1, 1206, -1, 1138, 2201, -5, -4, 1059, 2102, 1, -2, 0, 203, -2, 22101, 1, -3, -3, 21207, -2, 48, -1, 1205, -1, 1107, 22107, 57, -2, -1, 1205, -1, 1107, 21201, -2, -48, -2, 2201, -5, -4, 1090, 20102, 10, 0, -1, 22201, -2, -1, -2, 2201, -5, -4, 1103, 2102, 1, -2, 0, 1106, 0, 1060, 21208, -2, 10, -1, 1205, -1, 1162, 21208, -2, 44, -1, 1206, -1, 1131, 1106, 0, 989, 21102, 439, 1, 1, 1105, 1, 1150, 21101, 477, 0, 1, 1106, 0, 1150, 21101, 514, 0, 1, 21102, 1, 1149, 0, 1105, 1, 579, 99, 21101, 0, 1157, 0, 1105, 1, 579, 204, -2, 104, 10, 99, 21207, -3, 22, -1, 1206, -1, 1138, 1202, -5, 1, 1176, 1201, -4, 0, 0, 109, -6, 2105, 1, 0, 6, 9, 36, 1, 7, 1, 36, 1, 7, 1, 23, 7, 6, 1, 7, 1, 23, 1, 12, 1, 7, 1, 23, 1, 12, 1, 7, 1, 23, 1, 12, 5, 3, 1, 11, 13, 16, 1, 3, 1, 11, 1, 24, 11, 9, 1, 24, 1, 3, 1, 3, 1, 1, 1, 9, 1, 24, 1, 3, 1, 3, 1, 1, 1, 9, 1, 24, 1, 3, 1, 3, 1, 1, 1, 9, 1, 24, 1, 3, 1, 3, 13, 24, 1, 3, 1, 5, 1, 34, 7, 3, 1, 38, 1, 1, 1, 3, 1, 38, 1, 1, 1, 3, 1, 38, 1, 1, 1, 3, 1, 38, 7, 40, 1, 44, 1, 44, 1, 44, 1, 11, 7, 26, 1, 11, 1, 5, 1, 22, 11, 5, 1, 5, 1, 22, 1, 3, 1, 5, 1, 5, 1, 5, 1, 14, 13, 5, 1, 5, 1, 5, 1, 3, 1, 10, 1, 7, 1, 9, 1, 5, 1, 5, 1, 3, 1, 10, 1, 7, 1, 5, 13, 3, 1, 3, 1, 10, 1, 7, 1, 5, 1, 3, 1, 5, 1, 1, 1, 3, 1, 3, 1, 10, 1, 5, 13, 5, 1, 1, 1, 3, 1, 3, 1, 10, 1, 5, 1, 1, 1, 5, 1, 9, 1, 1, 1, 3, 1, 3, 1, 10, 1, 5, 1, 1, 1, 5, 1, 9, 11, 10, 1, 5, 1, 1, 1, 5, 1, 11, 1, 3, 1, 14, 7, 1, 7, 11, 1, 3, 5, 36, 1, 7, 1, 36, 1, 7, 1, 36, 1, 7, 1, 36, 1, 7, 1, 36, 1, 7, 1, 36, 9, 10];

    async function main() {
        const program = new Day17.AsciiBot(intCode);
        await program.executeProgram();
        console.log('part 1', Day17.getSumOfAlignmentParameters(program.map));


        const startPoints = Day17.getBotStartPoints(program.map); // IMPORTANT TO GET ALL STARTPOINTS


        MapEngine.printMap(program.map, (location) => {
            if (location.value.isStartPoint) return 'O';
            return String.fromCharCode(location.value.value);
        });
        const endPoints = Day17.getEndPoints(program.map); // IMPORTANT TO GET ALL STARTPOINTS
        const startingPoint = endPoints[0] === program.cameraPosition ? endPoints[0] : endPoints[1];
        const endingPoint = endPoints[0] === program.cameraPosition ? endPoints[1] : endPoints[0];
        endingPoint.value.isStartPoint = true;

        startPoints.forEach(point => Day17.buildAllPatterns(point, program.map));

        // build all patterns in each point until max, and count
        const solution = Day17.searchPatternSequence(startingPoint, program.map, Day17.Direction.UP, '',
            [], endingPoint, startingPoint, Day17.Direction.UP);
        console.log(solution);

        // {
        //   "sequence": "A,B,A,C,B,A,C,B,A,C",
        //   "patterns": [
        //     "L,6,L,4,R,12",
        //     "L,6,R,12,R,12,L,8",
        //     "L,6,L,10,L,10,L,6"
        //   ]
        // }

        // calculate instructions to give
        intCode[0] = 2;
        const vacuumRobot = new ProgramManager(intCode);
        let inputIndex = 0;
        const result = `${solution.sequence}${String.fromCharCode(10)}${solution.patterns[0]}${String.fromCharCode(10)}`
         + `${solution.patterns[1]}${String.fromCharCode(10)}${solution.patterns[2]}${String.fromCharCode(10)}`
        + `n${String.fromCharCode(10)}`;
        vacuumRobot.getInput = async () => {
            const value = result.charCodeAt(inputIndex);
            inputIndex++;
            console.log('input', value, String.fromCharCode(value))

            if (isNaN(value)) process.exit(0);
            return value;
        };
        vacuumRobot.writeOutput = output => {
            console.log('output', output);
            if (isNaN(output)) process.exit(0);
        };
        await vacuumRobot.executeProgram();

    }

    main().catch(console.log);
}
