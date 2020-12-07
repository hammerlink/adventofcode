import {FileEngine} from '../engine/file.engine';

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

    export const bagTree: { [color: string]: Bag } = {};

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
        const bagParts = line.split(' bags contain ');
        if (bagParts.length !== 2) throw new Error(`invalid bag line? ${line}`);
        const lineColor = bagParts[0].replace(' bags', '');
        const bag: Bag = createRawBag(lineColor);
        if (bag.color === 'mirrored bronze bags') {
            const x = null;
        }
        const containsLine = bagParts[1];
        const containsBags = containsLine.replace('.', '').split(', ');
        if (containsBags.indexOf('no other bags') > -1) return;
        containsBags.forEach(containBag => {
            const firstSpace = containBag.indexOf(' ');
            const amount = parseInt(containBag.substr(0, firstSpace));
            const color = containBag.substr(firstSpace + 1).replace(/\sbags?/, '');
            const colorBag = createRawBag(color);
            bag.children[color] = {
                amount,
                bag: colorBag,
            };
            colorBag.parents[bag.color] = {
                bag,
            }
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
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day7.input'), false);
        lines.forEach(Y2020_Day7.parseBag);

        const parents = Y2020_Day7.countParents('shiny gold', {}, ['shiny gold']);
        console.log(Object.keys(parents).length);

        console.log(Y2020_Day7.countChildren('shiny gold', {}))
    }

    main().catch(err => console.error(err));

}
