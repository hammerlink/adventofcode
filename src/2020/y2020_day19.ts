import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day19 {
    export interface Rule {
        ruleIndex: number;
        raw: string;

        value?: string;
        ruleOptions?: number[][];
        options: string[];
    }

    export interface RuleBook {
        book: { [ruleIndex: number]: Rule };
    }

    export function parseInput(lines: string[]): { ruleBook: RuleBook, messages: string[] } {
        let isRule = true;
        const messages = [];
        const ruleBook: RuleBook = {book: {}};
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line === '') {
                isRule = false;
                continue;
            }
            if (isRule) {
                const rule = parseRule(line);
                ruleBook.book[rule.ruleIndex] = rule;
            } else {
                messages.push(line);
            }
        }

        // removed, is impossible
        // calculateRuleOptions(ruleBook.book[0], ruleBook);

        return {ruleBook, messages};
    }

    export function calculateRuleOptions(rule: Rule, ruleBook: RuleBook): string[] {
        if (rule.options.length) return rule.options;

        const {ruleOptions} = rule;
        const allOptions: { [option: string]: boolean } = {};
        ruleOptions.forEach(ruleIndices => {
            let options: string[] = [''];
            ruleIndices.forEach(ruleIndex => {
                const ruleOptions = calculateRuleOptions(ruleBook.book[ruleIndex], ruleBook);
                options = combineOptions(options, ruleOptions);
            });
            options.forEach(option => allOptions[option] = true);
        });

        rule.options = Object.keys(allOptions);
        rule.options.sort();
        return rule.options;
    }

    export function combineOptions(optionsA: string[], optionsB: string[]): string[] {
        const allOptions: string[] = [];
        for (let i = 0; i < optionsA.length; i++) {
            const optionA = optionsA[i];
            for (let y = 0; y < optionsB.length; y++) {
                const optionB = optionsB[y];
                const combo = optionA + optionB;
                if (!allOptions.includes(combo)) allOptions.push(combo);
            }
        }
        return allOptions;
    }

    export function parseRule(line: string): Rule {
        const ruleIndex = parseInt(line.match(/(\d+):/)[1], 10);
        const raw = line.replace(/(\d+):/, '');
        if (raw.indexOf('"') > -1) {
            const value = raw.match(/"(.+)"/)[1];
            return {value, options: [value], ruleIndex, raw};
        }
        const parts = raw.split(' |');
        const ruleOptions = parts.map(part => {
            return part.match(/\s\d+/g).map(x => parseInt(x.replace(' ', ''), 10));
        });
        return {ruleOptions, ruleIndex, raw, options: []};
    }

    // get nextoption

    // break out if not enough letters are left

    export function getRuleSolutions(message: string, messageAttempt: string, rule: Rule, ruleBook: RuleBook,
                                     currentRules: number[], level = 0): { currentMessage: string, activeRules: number[] }[] {
        if (currentRules.includes(rule.ruleIndex)) return null;
        if (rule.value) {
            if (rule.value !== message[messageAttempt.length]) {
                return null;
            }
            return [{currentMessage: `${messageAttempt}${rule.value}`, activeRules: []}];
        }
        return tryBuildMessage(message, messageAttempt, rule, ruleBook, [...currentRules, rule.ruleIndex], level + 1);
    }

    export function tryBuildMessage(message: string, currentMessage: string, rule: Rule, ruleBook: RuleBook,
                                    currentRules: number[], level = 0): { currentMessage: string, activeRules: number[] }[] {
        if (currentMessage.length >= message.length && currentMessage !== message) return null;
        const {ruleOptions} = rule;
        const allSolutions: { currentMessage: string, activeRules: number[] }[] = [];
        for (let i = 0; i < ruleOptions.length; i++) {
            const ruleIndices = ruleOptions[i];
            let solutions: { currentMessage: string, activeRules: number[] }[] = [{
                currentMessage,
                activeRules: currentRules
            }];
            let newSolutions: { currentMessage: string, activeRules: number[] }[] = [];

            for (let j = 0; j < ruleIndices.length; j++) {
                const subRule = ruleBook.book[ruleIndices[j]];
                for (let s = 0; s < solutions.length; s++) {
                    let messageAttempt = solutions[s];
                    const subRuleSolutions = getRuleSolutions(message, messageAttempt.currentMessage, subRule, ruleBook, messageAttempt.activeRules, level);
                    if (!subRuleSolutions) continue;
                    subRuleSolutions.forEach(x => {
                        if (x.currentMessage.length <= message.length && message.startsWith(x.currentMessage) &&
                            !newSolutions.find(y => y.currentMessage === x.currentMessage)) newSolutions.push(x);
                    });
                }

                solutions = newSolutions;
                newSolutions = [];

                if (solutions.length === 0) break;
            }
            if (level === 0 && solutions.find(x => x.currentMessage === message)) return [{
                currentMessage: message,
                activeRules: []
            }];
            solutions.forEach(x => {
                if (x.currentMessage.length <= message.length && message.startsWith(x.currentMessage) &&
                    !allSolutions.find(y => y.currentMessage === x.currentMessage)) allSolutions.push(x);
            });
        }
        return allSolutions.length ? allSolutions : null;
    }

    export function isValidMessage(message: string, rule: Rule, ruleBook: RuleBook, logging: boolean): boolean {
        // multiple matches are possible?
        const buildMessage = tryBuildMessage(message, '', rule, ruleBook, []);
        if (logging && buildMessage) console.log(buildMessage);
        return !!buildMessage && buildMessage[0].currentMessage === message;
    }

    export function part1(lines: string[], logging = false): number {
        const {messages, ruleBook} = parseInput(lines);
        const baseRule = ruleBook.book[0];
        let validMessages = 0;
        messages.forEach(message => {
            if (isValidMessage(message, baseRule, ruleBook, logging)) validMessages++;
        });
        return validMessages;
    }

    export function part2(lines: string[]): number {
        return part1(lines.map(l => l
                .replace('8: 42', '8: 42 | 42 8')
                .replace('11: 42 31', '11: 42 31 | 42 11 31'))
            , true);
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        assert.strictEqual(Y2020_Day19.part1(`0: 4 1 5
1: 2 3 | 3 2
2: 4 4 | 5 5
3: 4 5 | 5 4
4: "a"
5: "b"

ababbb
bababa
abbbab
aaabbb
aaaabbb`.split('\n')), 2, 'example 1 part 1');

        // assert.strictEqual(Y2020_Day18.part2(exampleLines), 1, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day19.input'), false);
        // part 1
        const part1Result = Y2020_Day19.part1(lines);
        console.log(part1Result);

        assert.strictEqual(Y2020_Day19.part2(`42: 9 14 | 10 1
9: 14 27 | 1 26
10: 23 14 | 28 1
1: "a"
11: 42 31
5: 1 14 | 15 1
19: 14 1 | 14 14
12: 24 14 | 19 1
16: 15 1 | 14 14
31: 14 17 | 1 13
6: 14 14 | 1 14
2: 1 24 | 14 4
0: 8 11
13: 14 3 | 1 12
15: 1 | 14
17: 14 2 | 1 7
23: 25 1 | 22 14
28: 16 1
4: 1 1
20: 14 14 | 1 15
3: 5 14 | 16 1
27: 1 6 | 14 18
14: "b"
21: 14 1 | 1 14
25: 1 1 | 1 14
22: 14 14
8: 42
26: 14 22 | 1 20
18: 15 15
7: 14 5 | 1 21
24: 14 1

aaaaabbaabaaaaababaa
`.split('\n')), 1, 'example 1 part 2');
        // part 2
        const part2Result = Y2020_Day19.part2(lines);
        console.log(part2Result);

        //
    }

    main().catch(err => console.error(err));
}
