import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day02 {
    const MaxMap = { red: 12, green: 13, blue: 14 };

    type Pick = { color: keyof typeof MaxMap; amount: number };
    type Set = {
        index: number;
        picks: Pick[];
    };
    type Game = {
        index: number;
        sets: Set[];
        red?: number;
        green?: number;
        blue?: number;
    };
    function parseGame(line: string): Game {
        const match = line.match(/Game ([0-9]+): (.*)$/);
        const index = parseInt(match[1]);
        const gameMaxMap = { red: 0, green: 0, blue: 0 };
        const sets: Set[] = match[2].split('; ').map((set, index) => {
            const picks: Pick[] = set.split(', ').map((pick) => {
                const pieces = pick.split(' ');
                const color: keyof typeof MaxMap = pieces[1] as any;
                const amount = parseInt(pieces[0]);
                if (gameMaxMap[color] < amount) gameMaxMap[color] = amount;
                return { color, amount };
            });
            return { index, picks };
        });
        return { index, sets, ...gameMaxMap };
    }
    function isGamePossible(game: Game): boolean {
        if (game.red > MaxMap.red) return false;
        if (game.blue > MaxMap.blue) return false;
        if (game.green > MaxMap.green) return false;
        return true;
    }
    export function part1(lines: string[]): number {
        const games = lines.map(parseGame);
        console.log(JSON.stringify(games.map(x => ({...x, sets: undefined})), null ,4));
        return games.filter(isGamePossible).reduce((t, v) => t + v.index, 0);
    }
    export function part2(lines: string[]): number {
        const games = lines.map(parseGame);
        return games.reduce((t, v) => t + (v.red * v.green * v.blue), 0);
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day02.example'),
            false,
        );

        assert.equal(Y2023_Day02.part1(exampleLines), 8, 'example 1 part 1');

        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day02.input'),
            false,
        );
        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day02.part1(lines);
        // assert.equal(part1Result, 54573);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);

        // part 2
        assert.equal(Y2023_Day02.part2(exampleLines), 2286, 'example 1 part 2');

        startMs = Date.now();
        const part2Result = Y2023_Day02.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
    }

    main().catch((err) => console.error(err));
}
