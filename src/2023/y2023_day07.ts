import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day07 {
    const cardTypes = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    type HandCard = { card: string; amount: number; value: number };

    type Hand = { cards: string[]; handCards: HandCard[]; bid: number; values: number[] };

    function parseLineToHand(line: string): Hand {
        const pieces = line.split(' ');
        const cards = pieces[0].split('');
        const bid = parseInt(pieces[1]);
        const handCards: HandCard[] = [];
        cards.forEach((card) => {
            const value = cardTypes.indexOf(card);
            let handCard = handCards.find((x) => x.card === card);
            if (!handCard) {
                handCard = { value, card, amount: 0 };
                handCards.push(handCard);
            }
            handCard.amount++;
        });
        handCards.sort((a, b) => {
            if (a.amount !== b.amount) return b.amount - a.amount;
            return a.value - b.value;
        });
        return { cards, bid, handCards, values: cards.map((x) => cardTypes.indexOf(x)) };
    }

    export function part1(lines: string[]): number {
        const hands = lines.map(parseLineToHand);
        // sort by increasing strength
        hands.sort((a, b) => {
            // higher identical amount
            if (a.handCards[0].amount !== b.handCards[0].amount) return a.handCards[0].amount - b.handCards[0].amount;
            // second pair?
            if (a.handCards[0].amount !== 5 && a.handCards[1].amount !== b.handCards[1].amount)
                return a.handCards[1].amount - b.handCards[1].amount;
            // high card iterate actual cards

            for (let i = 0; i < a.values.length; i++) {
                if (a.values[i] !== b.values[i]) return b.values[i] - a.values[i];
            }

            // for (let i = 0; i < a.handCards.length; i++) {
            //     if (a.handCards[i].value !== b.handCards[i].value) return a.handCards[i].value - b.handCards[i].value;
            // }
            return 0;
        });
        return hands.reduce((t, v, index) => t + v.bid * (index + 1), 0);
    }

    export function part2(lines: string[]): number {
        return 0;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day07.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day07.input'),
            false,
        );

        assert.equal(Y2023_Day07.part1(exampleLines), 6440, 'example 1 part 1');

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day07.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        // assert.equal(part1Result, 2065338);

        // part 2
        assert.equal(Y2023_Day07.part2(exampleLines), 0, 'example 1 part 2');

        startMs = Date.now();
        const part2Result = Y2023_Day07.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 0);
    }

    main().catch((err) => console.error(err));
}
