import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day23 {
    export interface Game {
        maxCup: number;
        minCup: number;
        currentCupIndex: number;
        cups: number[];
    }

    export function pickupCups(cups: number[], startIndex: number, amount = 3): number[] {
        let pickedUpCups: number[] = cups.splice(startIndex + 1, 3);
        if (pickedUpCups.length < amount) pickedUpCups = pickedUpCups.concat(cups.splice(0, amount - (pickedUpCups.length)));
        return pickedUpCups;
    }

    export function getDestinationCup(currentCupValue: number, cups: number[], game: Game, selectedCups: number[]): {index: number, value: number} {
        let targetValue = currentCupValue - 1;
        if (targetValue < game.minCup) targetValue = game.maxCup;
        while (selectedCups.findIndex(x => x === targetValue) !== -1) {
            targetValue--;
            if (targetValue < game.minCup) targetValue = game.maxCup; // work with presorted values
        }
        const index = cups.findIndex(x => x === targetValue);
        return {index, value: cups[index]};
    }

    export function executeRound(game: Game, round: number) {
        if (round % 1000 === 0) console.log(round, new Date().getTime());
        const {cups, currentCupIndex} = game;
        const currentCup = cups[currentCupIndex];
        const pickedupCups = pickupCups(cups, currentCupIndex);
        const destinationCup = getDestinationCup(currentCup, cups, game, pickedupCups);
        let newCups = [...cups.slice(0, destinationCup.index + 1), ...pickedupCups, ...cups.slice(destinationCup.index + 1)];
        const newCurrentCupIndex = newCups.findIndex(x => x === currentCup);
        game.cups = newCups;
        game.currentCupIndex = (newCurrentCupIndex + 1) % game.cups.length;
    }

    export function parseInput(line: string): Game {
        const cups = line.split('').map(x => parseInt(x, 10));
        let minCup = cups[0];
        let maxCup = cups[0];
        for (let i = 0; i < cups.length; i++) {
            if (cups[i] < minCup) minCup = cups[i];
            if (cups[i] > maxCup) maxCup = cups[i];
        }
        let currentCupIndex = 0;
        return {cups, maxCup, minCup, currentCupIndex};
    }

    export function part1(line: string): number {
        const game: Game = parseInput(line);
        for (let i = 0; i < 100; i++) executeRound(game, i);
        const index1 = game.cups.findIndex(x => x === 1);
        return parseInt([...game.cups.slice(index1 + 1), ...game.cups.slice(0, index1)].join(''), 10);
    }

    export function part2(line: string): number {
        const game: Game = parseInput(line);
        for (let i = game.maxCup + 1; i <= 1000000; i++) game.cups.push(i);
        game.maxCup = 1000000;
        for (let i = 0; i < 10000000; i++) executeRound(game, i);
        const index1 = game.cups.findIndex(x => x === 1);
        const result = [...game.cups.slice(index1 + 1), ...game.cups.slice(0, index1)]
        return result[index1 + 1] * result[index1 + 2];
    }

    export function cheat2(data: string): number {
        let input = data.split('').map(cup => parseInt(cup, 10)- 1);
        let next = new Int32Array(1000000);
        let prev = new Int32Array(1000000);
        for (let i = 0; i < 1000000; i++) {
            next[i] = i + 1;
            prev[i] = i - 1;
        }
        next[999999] = 0;
        prev[0] = 999999;
        let current = 999999;
        for (let cup of input) {
            next[prev[cup]] = next[cup];
            prev[next[cup]] = prev[cup];
            next[cup] = next[current];
            prev[cup] = current;
            prev[next[current]] = cup;
            next[current] = cup;
            current = cup;
        }
        current = 999999;
        for (let i = 0; i < 10000000; i++) {
            current = next[current];
            let a = next[current];
            let b = next[a];
            let c = next[b];
            next[current] = next[c];
            prev[next[c]] = current;
            let destination = current - 1 < 0 ? 999999 : current - 1;
            while (destination == a || destination == b || destination == c) {
                destination = destination == 0 ? 999999 : destination - 1;
            }
            next[c] = next[destination];
            prev[a] = destination;
            prev[next[destination]] = c;
            next[destination] = a;
        }
        let multiplied = (next[0] + 1) * (next[next[0]] + 1);
        return multiplied;
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleCups = [8,3,6,7,4,1, 9, 2, 5];
        const pickup = Y2020_Day23.pickupCups(exampleCups, 7);
        assert.strictEqual(JSON.stringify(pickup), JSON.stringify([5,8,3]));
        assert.strictEqual(JSON.stringify(exampleCups), JSON.stringify([6,7,4,1,9,2]));

        // const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day23.example'), false);

        assert.strictEqual(Y2020_Day23.part1('389125467'), 67384529, 'example 1 part 1');

        assert.strictEqual(Y2020_Day23.cheat2('389125467'), 149245887792, 'example 1 part 2');

        // const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day23.input'), false);
        // part 1
        const part1Result = Y2020_Day23.part1('327465189');
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day23.cheat2('327465189');
        console.log(part2Result);
        // 31793
        // 32789
    }

    main().catch(err => console.error(err));
}
