import * as assert from 'assert';
import {BasicMap, MapEngine} from '../engine/map.engine';

const path = require('path');
import fs = require('fs');

export namespace Y2022_Day17 {
    export const ROCK_PATTERNS: RockTemplate[] = fs
        .readFileSync(path.join(__dirname, './data/y2022_day17.patterns'))
        .toString()
        .split('\n\n')
        .map((x) => {
            const lines = x.split('\n');
            if (!lines.length) return null;
            const map = MapEngine.newMap<boolean>();
            for (let y = 0; y < lines.length; y++) {
                const line = lines[y];
                for (let x = 0; x < line.length; x++) {
                    if (line[x] === '#') MapEngine.setPointInMap(map, x, y, true);
                }
            }

            return map;
        }).filter(x => x !== null);
    type RockTemplate = BasicMap<boolean>;

    type Rock = { template: RockTemplate; bottomLeftY: number; bottomLeftX: number };

    type TowerCell = { isRock: boolean };

    function dropRock(
        map: BasicMap<TowerCell>,
        rock: Rock,
        jetSequence: string,
        jetIndex: number,
        index: number
    ): { jetIndex: number } {
        // minX  = -2 ; maxX = 4
        // rock index 9 is not correct
        let moveDown = false;
        while (true) {
            // console.log('x', rock.bottomLeftX, 'y', rock.bottomLeftY, jetIndex);
            // if (index === 9) {
            //     const mapToPrint = JSON.parse(JSON.stringify(map));
            //     placeRock(mapToPrint, rock, index + 1000000);
            // }
            let bottomLeftX = rock.bottomLeftX;
            let bottomLeftY = rock.bottomLeftY;
            if (moveDown) {
                bottomLeftY += 1;
            } else {
                const isLeft = jetSequence[jetIndex] === '<';
                bottomLeftX += isLeft ? -1 : 1;
            }
            const isValid = canBeInPosition(map, {...rock, bottomLeftX, bottomLeftY});
            if (moveDown && !isValid) break;
            if (isValid) {
                rock.bottomLeftX = bottomLeftX;
                rock.bottomLeftY = bottomLeftY;
            }

            if (!moveDown) {
                jetIndex++;
                if (jetIndex >= jetSequence.length) jetIndex = 0;
            }
            moveDown = !moveDown;

        }
        placeRock(map, rock, index);
        return {jetIndex};
    }

    function placeRock(map: BasicMap<TowerCell>, rock: Rock, index: number) {
        for (let y = rock.template.minY; y <= rock.template.maxY; y++) {
            for (let x = rock.template.minX; x <= rock.template.maxX; x++) {
                const rockPoint = MapEngine.getPoint(rock.template, x, y);
                if (!rockPoint) continue;
                const mapX = rock.bottomLeftX + x;
                const mapY = rock.bottomLeftY + y;
                MapEngine.setPointInMap(map, mapX, mapY, {isRock: true});
            }
        }
        // printMap(map, index);
    }

    function printMap(map: BasicMap<TowerCell>, index: number) {
        console.log(`---- rock ${index} ----`);
        MapEngine.printMap(map, (l, x) => {
            if (x < 0 || x >= 7) return '|';
            return l?.value?.isRock ? '#' : '.'
        });
    }

    function canBeInPosition(map: BasicMap<TowerCell>, rock: Rock): boolean {
        for (let y = rock.template.minY; y <= rock.template.maxY; y++) {
            for (let x = rock.template.minX; x <= rock.template.maxX; x++) {
                const rockPoint = MapEngine.getPoint(rock.template, x, y);
                if (!rockPoint) continue;
                const mapX = rock.bottomLeftX + x;
                if (mapX < 0 || mapX >= 7) return false;
                const mapY = rock.bottomLeftY + y;
                if (mapY >= 0) return false;
                const cell = MapEngine.getPoint(map, mapX, mapY);
                if (cell?.value?.isRock) return false;
            }
        }
        return true;
    }

    function spawnRock(map: BasicMap<TowerCell>, rockIndex: number): { rock: Rock; rockIndex: number } {
        let currentRockIndex = rockIndex;
        const rockTemplate = ROCK_PATTERNS[currentRockIndex];
        rockIndex++;
        if (rockIndex >= ROCK_PATTERNS.length) rockIndex = 0;
        return {
            rock: {
                bottomLeftY: map.minY - 4 - rockTemplate.maxY,
                bottomLeftX: 2,
                template: JSON.parse(JSON.stringify(rockTemplate)),
            },
            rockIndex,
        };
    }

    export function part1(jetSequence: string): number {
        jetSequence = jetSequence.replace(/[^<>]/g, '');
        console.log(jetSequence, jetSequence.length)
        const map = MapEngine.newMap<TowerCell>();
        for (let x = -1; x < 8; x++) MapEngine.setPointInMap(map, x, 0, {isRock: true});
        let rockIndex = 0;
        let jetIndex = 0;
        for (let i = 0; i < 2022; i++) {
            const {rock, rockIndex: newRockIndex} = spawnRock(map, rockIndex);
            rockIndex = newRockIndex;
            const {jetIndex: newJetIndex} = dropRock(map, rock, jetSequence, jetIndex, i);
            jetIndex = newJetIndex;
        }


        map.maxY = map.minY + 10;
        printMap(map, 2022);

        return -map.minY;
    }

    export function part2(line: string): number {
        return 0;
    }
}

if (!module.parent) {
    async function main() {
        const exampleSequence = fs.readFileSync(path.join(path.dirname(__filename), './data/y2022_day17.example')).toString();

        assert.equal(Y2022_Day17.part1(exampleSequence), 3068, 'example 1 part 1');
        assert.equal(Y2022_Day17.part2(exampleSequence), 0, 'example 1 part 2');

        const inputSequence = fs
            .readFileSync(path.join(path.dirname(__filename), './data/y2022_day17.input'))
            .toString();
        // part 1
        let startMs = Date.now();
        const part1Result = Y2022_Day17.part1(inputSequence);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        // > 3208

        // part 2
        startMs = Date.now();
        const part2Result = Y2022_Day17.part2(inputSequence);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
    }

    main().catch((err) => console.error(err));
}
