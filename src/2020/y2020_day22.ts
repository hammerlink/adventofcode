import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day22 {
    export interface Player {
        cards: {value: number}[];
    }

    export interface Game {
        player1: Player;
        player2: Player;
        history: {[record: string]: boolean};
    }

    export function readInput(lines: string[]): Game {
        const game: Game = {
            player1: {cards: []},
            player2: {cards: []},
            history: {},
        };
        let isPlayer1 = true;
        lines.forEach(line => {
           if (line.match(/Player 2/)) {
               isPlayer1 = false;
               return;
           } else if (line.match(/^\d+$/)) {
               (isPlayer1 ? game.player1 : game.player2).cards.push({value: parseInt(line, 10)});
           }
        });
        return game;
    }

    export function executeGame(game: Game): {player1isWinner: boolean, game: Game, winner: Player} {
        while (!!game.player1.cards.length && !!game.player2.cards.length) {
            executeRound(game);
        }
        return {player1isWinner: !!game.player1.cards.length, winner: !!game.player1.cards.length ? game.player1 : game.player2, game};
    }

    export function executeRound(game: Game) {
        if (!game.player1.cards.length) throw new Error('player 1 out of cards');
        if (!game.player2.cards.length) throw new Error('player 2 out of cards');
        const player1Card = game.player1.cards.shift();
        const player2Card = game.player2.cards.shift();
        const player1IsWinner = player1Card.value > player2Card.value;
        const winningCard = player1IsWinner ? player1Card : player2Card;
        const losingCard = !player1IsWinner ? player1Card : player2Card;
        (player1IsWinner ? game.player1 : game.player2).cards.push(winningCard, losingCard);
    }

    export function printGameToRecord(game: Game): string {
        return `P${game.player1.cards.map(x => x.value).join(',')}P${game.player2.cards.map(x => x.value).join(',')}`;
    }

    export function executeRecursionGame(game: Game): {player1isWinner: boolean, game: Game, winner: Player} {
        let counter = 0;
        let player1isWinner: boolean = undefined;
        while (!!game.player1.cards.length && !!game.player2.cards.length) {
            const result = executeRoundRecursiveCombat(game);
            if (result.gameOver) {
                player1isWinner = result.player1IsWinner;
                break;
            }
            counter++;
        }
        if (player1isWinner === undefined) player1isWinner = game.player1.cards.length > game.player2.cards.length;
        return {player1isWinner, winner: player1isWinner ? game.player1 : game.player2, game};
    }

    export function executeRoundRecursiveCombat(game: Game): {gameOver: boolean, player1IsWinner?: boolean} {
        const record = printGameToRecord(game);
        if (game.history[record]) return {gameOver: true, player1IsWinner: true};
        game.history[record] = true;
        if (!game.player1.cards.length) throw new Error('player 1 out of cards');
        if (!game.player2.cards.length) throw new Error('player 2 out of cards');
        const player1Card = game.player1.cards.shift();
        const player2Card = game.player2.cards.shift();
        let player1IsWinner = player1Card.value > player2Card.value;
        if (player1Card.value <= game.player1.cards.length && player2Card.value <= game.player2.cards.length) {
            const result = executeRecursionGame({
                player1: {cards: game.player1.cards.slice(0, player1Card.value)},
                player2: {cards: game.player2.cards.slice(0, player2Card.value)},
                history: {}});
            player1IsWinner = result.player1isWinner;
        }
        const winningCard = player1IsWinner ? player1Card : player2Card;
        const losingCard = !player1IsWinner ? player1Card : player2Card;
        (player1IsWinner ? game.player1 : game.player2).cards.push(winningCard, losingCard);
        return {gameOver: false}
    }

    export function part1(lines: string[]): number {
        const game = readInput(lines);
        const results = executeGame(game);
        const totalCards = results.winner.cards.length;

        return results.winner.cards.reduce((total, card, index) => {
            return total + card.value * (totalCards - index);
        }, 0);
    }

    export function part2(lines: string[]): number {
        const game = readInput(lines);
        const results = executeRecursionGame(game);
        const totalCards = results.winner.cards.length;

        return results.winner.cards.reduce((total, card, index) => {
            return total + card.value * (totalCards - index);
        }, 0);
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {

        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day22.example'), false);

        assert.strictEqual(Y2020_Day22.part1(exampleLines), 306, 'example 1 part 1');

        assert.strictEqual(Y2020_Day22.part2(exampleLines), 291, 'example 1 part 2');

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day22.input'), false);
        // part 1
        const part1Result = Y2020_Day22.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day22.part2(lines);
        console.log(part2Result);
        // 31793
        // 32789
    }

    main().catch(err => console.error(err));
}
