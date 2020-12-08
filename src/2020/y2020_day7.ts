import {FileEngine} from '../engine/file.engine';
import { expect } from 'chai';
import * as assert from 'assert';

export namespace Y2020_Day7 {
    export interface Bag {
        color: string;
        children: {
            [color: string]: {
                amount: number;
                bag: Bag;
            }
        };
        parents: {
            [color: string]: {
                bag: Bag;
            }
        };
    }

    export let bagTree: { [color: string]: Bag } = {};

    export function createRawBag(color: string): Bag {
        if (bagTree[color]) return bagTree[color];
        bagTree[color] = {
            color,
            children: {},
            parents: {},
        };
        return bagTree[color];
    }

    export function parseBag(line: string) {
        const bag: Bag = createRawBag(line.match(/^([a-z]+\s[a-z]+) bags contain/)[1]);

        const rawBagRules = line.match(/(\d+ [a-z]+ [a-z]+ bags?)/g);
        if (!rawBagRules || rawBagRules.length === 0) return;
        const bagRules: { amount: number; color: string }[] = (rawBagRules as string[])
            .map((bagRule: string) => bagRule.match(/(\d+) ([a-z]+\s[a-z]+)/))
            .map<{ amount: number; color: string }>(result => ({amount: parseInt(result[1]), color: result[2]}));

        bagRules.forEach(bagRule => {
            const {color, amount} = bagRule;
            const colorBag = createRawBag(color);
            bag.children[color] = {amount, bag: colorBag, };
            colorBag.parents[bag.color] = {bag,}
        });
    }

    export function countParents(color: string, colors: {[color: string]: { path: string[] }}, path: string[]
    ): {[color: string]: { path: string[] }} {
        const bag = bagTree[color];
        if (colors[color]) {
            return colors;
        }

        colors[color] = {path};
        for (const color in bag.parents) {
            countParents(color, colors, [...path, color]);
        }
        return colors;
    }

    export function countChildren(color: string, colors: {[color: string]: { childrenCount: number }}): number {
        const bag = bagTree[color];
        if (colors[color]) {
            return colors[color].childrenCount;
        }
        let childrenCount = 0;
        for (const color in bag.children) {
            if (!colors[color]) countChildren(color, colors);
            const childChildrenCount = colors[color].childrenCount;
            childrenCount += bag.children[color].amount * (1 + childChildrenCount);
        }
        colors[color] = {childrenCount};
        return childrenCount;
    }

    export function part1(lines: string[], color: string = 'shiny gold'): number {
        bagTree = {};
        lines.forEach(parseBag);
        const parents = Y2020_Day7.countParents(color, {}, [color]);
        return Object.keys(parents).length - 1;
    }

    export function part2(lines: string[], color: string = 'shiny gold'): number {
        bagTree = {};
        lines.forEach(parseBag);
        return countChildren(color, {});
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day7.example'));
        assert.equal(Y2020_Day7.part1(exampleLines, 'shiny gold'), 4, 'example 1 part 1')
        assert.equal(Y2020_Day7.part2(exampleLines, 'shiny gold'), 32, 'example 1 part 1')
        const example2 = `shiny gold bags contain 2 dark red bags.
dark red bags contain 2 dark orange bags.
dark orange bags contain 2 dark yellow bags.
dark yellow bags contain 2 dark green bags.
dark green bags contain 2 dark blue bags.
dark blue bags contain 2 dark violet bags.
dark violet bags contain no other bags.`;
        expect(Y2020_Day7.part2(example2.split('\n'), 'shiny gold'), 'part 2, example 2 failing').equals(126);

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day7.input'));
        // part 1
        const part1Result = Y2020_Day7.part1(lines, 'shiny gold');
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day7.part2(lines, 'shiny gold');
        console.log(part2Result);


        assert.equal(part1Result, 235, 'part 1 competition');
        assert.equal(part2Result, 158493, 'part 2 competition');
    }

    main().catch(err => console.error(err));

}
