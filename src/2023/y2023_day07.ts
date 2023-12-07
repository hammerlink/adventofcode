import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day07 {
    const cardTypes = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    type HandCard = { card: string; amount: number; value: number };

    type Card = { card: string; value: number };
    type Hand = {
        originalCards: Card[];
        rawOriginal: string;
        cards: Card[];
        bid: number;
        values: number[];
        score?: number;
        possibleJokerCards: Card[];
        scoreCards?: string;
    };

    const JOKER_VALUE = 30 - cardTypes.indexOf('J');

    function getHandScore(hand: Hand, withJoker: boolean): number {
        // first number = amount
        // second number = has second pair
        // value 1st card, 2 digits
        // value 2nd card, 2 digits
        // value 3rd card, 2 digits
        // value 4th card, 2 digits
        // value 5th card, 2 digits
        const handCards = getHandCards(hand);
        return parseInt(
            `${handCards[0].amount}${handCards[1]?.amount === 2 ? 1 : 0}${hand.originalCards.reduce(
                (t, v) => (withJoker && v.card === 'J' ? t + '00' : t + v.value),
                '',
            )}`,
        );
    }

    function getHandCards(hand: Hand): HandCard[] {
        const handCards: HandCard[] = [];
        hand.cards.forEach((card) => {
            const value = cardTypes.indexOf(card.card);
            let handCard = handCards.find((x) => x.card === card.card);
            if (!handCard) {
                handCard = { value, card: card.card, amount: 0 };
                handCards.push(handCard);
            }
            handCard.amount++;
        });
        handCards.sort((a, b) => {
            if (a.amount !== b.amount) return b.amount - a.amount;
            return a.value - b.value;
        });
        return handCards;
    }

    function parseLineToHand(line: string, withJoker = false): Hand {
        const pieces = line.split(' ');
        const rawCards = pieces[0].split('');
        const bid = parseInt(pieces[1]);
        const cards = rawCards.map((x) => ({ card: x, value: 30 - cardTypes.indexOf(x) }));
        const possibleJokerCards = [{ card: 'A', value: 30 - cardTypes.indexOf('A') }];
        cards.forEach((x) => {
            if (x.card !== 'J' && !possibleJokerCards.find((y) => x.card === y.card)) possibleJokerCards.push({ ...x });
        });
        const hand: Hand = {
            originalCards: [...cards],
            rawOriginal: pieces[0],
            cards,
            bid,
            values: rawCards.map((x) => cardTypes.indexOf(x)),
            possibleJokerCards,
        };
        hand.score = getHandScore(hand, withJoker);
        if (withJoker) replaceJokers(hand);
        return hand;
    }

    function replaceJokers(hand: Hand) {
        const remainingJokerCards = hand.cards.filter((x) => x.card === 'J');
        if (!remainingJokerCards.length) {
            const score = getHandScore(hand, true);
            if (score > hand.score) {
                hand.score = score;
                hand.scoreCards = hand.cards.reduce((t, card) => t + card.card, '');
            }
            return;
        }

        for (let i = 0; i < remainingJokerCards.length; i++) {
            const original = remainingJokerCards[i];
            const handIndex = hand.cards.indexOf(original);

            hand.possibleJokerCards.forEach((card) => {
                hand.cards[handIndex] = { ...card };
                replaceJokers(hand);
            });

            hand.cards[handIndex] = original;
        }
    }

    export function part1(lines: string[]): number {
        const hands = lines.map((line) => parseLineToHand(line));
        // sort by increasing strength
        hands.sort((a, b) => a.score - b.score);
        return hands.reduce((t, v, index) => t + v.bid * (index + 1), 0);
    }

    export function part2(lines: string[]): number {
        const hands = lines.map((line) => parseLineToHand(line, true));
        // sort by increasing strength
        hands.sort((a, b) => a.score - b.score);
        // hands.forEach((x) =>
        //     console.log(`start: ${x.rawOriginal} scoreCards: ${x.scoreCards ?? x.rawOriginal} score: ${x.score}`),
        // );
        return hands.reduce((t, v, index) => t + v.bid * (index + 1), 0);
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
        assert.equal(part1Result, 247815719);

        // part 2
        assert.equal(Y2023_Day07.part2(exampleLines), 5905, 'example 1 part 2');

        startMs = Date.now();
        const part2Result = Y2023_Day07.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        assert.equal(part2Result, 248747492);
    }

    main().catch((err) => console.error(err));
}
