import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day04 {
    type Card = {
        index: number;
        winningNumbers: number[];
        playingNumbers: number[];
        count: number;
    };
    export function parseCard(line: string): Card {
        const match = line.match(/Card\s+(\d+): (.*)$/);
        const index = parseInt(match[1]);
        const other = match[2];
        const pieces = other.split(' | ');
        const winningNumbers = pieces[0].split(/\s+/).map((x) => parseInt(x));
        const playingNumbers = pieces[1].split(/\s+/).map((x) => parseInt(x));
        return { index, winningNumbers, playingNumbers, count: 1 };
    }
    function calculatePoints(card: Card): number {
        const matchCount = card.playingNumbers.filter((x) => card.winningNumbers.includes(x)).length;
        if (matchCount === 0) return 0;
        return Math.pow(2, matchCount - 1);
    }
    function calculateCount(card: Card): number {
        return card.playingNumbers.filter((x) => card.winningNumbers.includes(x)).length;
    }
    export function part1(lines: string[]): number {
        const cards = lines.map(parseCard);
        return cards.reduce((t, v) => {
            const points = calculatePoints(v);
            return t + points;
        }, 0);
    }
    export function part2(lines: string[]): number {
        const cards = lines.map(parseCard);
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const points = calculateCount(card);
            if (!points) continue;
            for (let x = 0; x < points; x++) {
                const j = i + 1 + x;
                if (j > cards.length - 1) break;
                cards[j].count += card.count;
            }
        }
        return cards.reduce((t, v) => {
            return t + v.count;
        }, 0);
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day04.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day04.input'),
            false,
        );

        assert.equal(Y2023_Day04.part1(exampleLines), 13, 'example 1 part 1');

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day04.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 18653);

        // part 2
        assert.equal(Y2023_Day04.part2(exampleLines), 30, 'example 1 part 2');

        startMs = Date.now();
        const part2Result = Y2023_Day04.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 5921508);
    }

    main().catch((err) => console.error(err));
}
