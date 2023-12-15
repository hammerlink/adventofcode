import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day12 {
    type MaterialList = {
        '.': number;
        '#': number;
        '?': number;
    };
    type SpringBlock = {
        size: number;
        /** the first possible spring index of a group */
        possibleStartIndex?: number;
        /** the last possible spring index of a group */
        possibleEndIndex?: number;
        possibilities?: number;
        possibilityMap: {
            [startIndex: number]: number;
        }
    };
    type SpringLine = {
        line: string;
        blockSizes: SpringBlock[];
        materialList: MaterialList;
    };

    function emptyMaterialList(): MaterialList {
        return {
            '#': 0,
            '?': 0,
            '.': 0,
        };
    }

    function getMaterialList(line: string): MaterialList {
        const materialList = emptyMaterialList();
        for (let i = 0; i < line.length; i++) materialList[line[i]]++;
        return materialList;
    }

    function getFirstPossibility(line: string, blockSize: number): RegExpMatchArray | undefined {
        return line.match(new RegExp(`[^#][#?]{${blockSize}}[^#]`));
    }

    function prepareLine(inputLine: string, repetitions: number): SpringLine {
        const pieces = inputLine.split(' ');

        const baseLine: string = pieces[0];
        let line = baseLine;
        if (baseLine.length) for (let i = 0; i < repetitions; i++) line += '?' + baseLine;
        line = `.${line}.`;

        const materialList = getMaterialList(line);

        const baseRawCheckLine = pieces[1];
        let baseCheckLine = baseRawCheckLine;
        if (baseRawCheckLine.length) for (let i = 0; i < repetitions; i++) baseCheckLine += ',' + baseRawCheckLine;
        const blockSizes: SpringBlock[] = baseCheckLine.split(',').map((x) => ({
            size: parseInt(x, 10),
            possibilityMap: {}
        }));

        // console.log('===========================');
        // console.log(
        //     line,
        //     blockSizes.map((x) => x.size).join(','),
        // );

        return {blockSizes, line, materialList};
    }

    function calculatePossibilityRanges(springLine: SpringLine) {
        let lineIndex = 0;
        springLine.blockSizes.forEach((blockSize) => {
            const lineSlice = springLine.line.substring(lineIndex);
            const match = getFirstPossibility(lineSlice, blockSize.size);
            if (!match) throw new Error('no match found');

            blockSize.possibleStartIndex = lineIndex + match.index + 1;
            lineIndex += match.index + match[0].length - 1;
        });

        // reverse & determine end index
        lineIndex = 0;
        springLine.line = springLine.line.split('').reverse().join('');
        springLine.blockSizes.reverse();

        springLine.blockSizes.forEach((blockSize) => {
            const endIndex = springLine.line.length - 1 - blockSize.possibleStartIndex;
            const lineSlice = springLine.line.substring(lineIndex, endIndex + 2); // needs to have the extra end available
            const match = getFirstPossibility(lineSlice, blockSize.size);
            if (!match) throw new Error('no match found');

            blockSize.possibleEndIndex = springLine.line.length - 1 - (lineIndex + match.index + 1);
            lineIndex += match.index + match[0].length - 1;
        });

        // return to original
        springLine.line = springLine.line.split('').reverse().join('');
        springLine.blockSizes.reverse();

        springLine.blockSizes.forEach((blockSize) => {
            blockSize.possibilities =
                blockSize.possibleEndIndex + 1 - blockSize.possibleStartIndex + 1 - blockSize.size;
            // printReplacedPiece(springLine, blockSize);
        });
    }

    function printReplacedPiece({line}: SpringLine, springBlock: SpringBlock) {
        if (springBlock.possibleEndIndex === undefined) return;
        let printLine = line.substring(0, springBlock.possibleStartIndex);
        for (let i = springBlock.possibleStartIndex; i <= springBlock.possibleEndIndex; i++) printLine += '0';
        printLine += line.substring(springBlock.possibleEndIndex + 1);
        // console.log(printLine, springBlock.size, springBlock.possibilities);
    }

    function splitInOverlappingSpringBlocks(springLine: SpringLine): SpringBlock[][] {
        const output: SpringBlock[][] = [];
        let currentGroup: SpringBlock[] = [];
        for (let i = 0; i < springLine.blockSizes.length; i++) {
            const block = springLine.blockSizes[i];
            currentGroup.push(block);
            const previousBlock = springLine.blockSizes[i - 1];
            const nextBlock = springLine.blockSizes[i + 1];
            const isOverlapping =
                (previousBlock && previousBlock.possibleEndIndex >= block.possibleStartIndex - 1) ||
                (nextBlock && nextBlock.possibleStartIndex <= block.possibleEndIndex + 1);
            if (!isOverlapping) {
                output.push(currentGroup);
                currentGroup = [];
            }
        }
        if (currentGroup.length) output.push(currentGroup);
        return output;
    }

    function calculatePossibilities(
        springBlockGroup: SpringBlock[],
        springBlockIndex: number,
        lineIndex: number,
        line: string,
        blockEndLineIndex: number,
    ): number {
        let output = 0;
        if (springBlockIndex > springBlockGroup.length - 1) {
            // check if there are any remaining springs
            const endSlice = line.slice(lineIndex, blockEndLineIndex + 1);
            const isPossible = !endSlice.match(/#/);
            if (!isPossible) return 0;
            const originalLine = line.substring(springBlockGroup[0].possibleStartIndex, blockEndLineIndex + 1);
            // console.log(line, originalLine.replace(/\?/g, '.'));
            return 1;
        }
        const springBlock = springBlockGroup[springBlockIndex];
        const startIndex = Math.max(springBlock.possibleStartIndex, lineIndex);
        if (startIndex > lineIndex) {
            const interSlice = line.slice(lineIndex, startIndex);
            if (interSlice.match('#')) return 0;
        }
        const maxStartIndex = springBlock.possibleEndIndex - (springBlock.size - 1);
        if (maxStartIndex < startIndex) return output;
        // check for springs

        for (let i = startIndex; i <= maxStartIndex; i++) {
            if (i - startIndex > 1) {
                const interSlice = line.slice(startIndex, i);
                if (interSlice.match('#')) break;
            }
            const slice = line.slice(i - 1, i + springBlock.size + 1);
            const sliceMatch = getFirstPossibility(slice, springBlock.size);
            if (!sliceMatch) continue;
            const nextStartIndex = i + springBlock.size + 1;

            if (springBlock.possibilityMap[i] !== undefined) {
                output += springBlock.possibilityMap[i];
                continue;
            }

            let replacedLine = `${line}`;
            for (let x = i; x < i + springBlock.size; x++)
                replacedLine = replacedLine[x] === '?' ? replaceCharAt(replacedLine, x, `X`) : replacedLine;
            const possibilities =
                calculatePossibilities(
                    springBlockGroup,
                    springBlockIndex + 1,
                    nextStartIndex,
                    replacedLine,
                    blockEndLineIndex,
                );
            springBlock.possibilityMap[i] = possibilities;
            output += possibilities;
        }
        return output;
    }

    function replaceCharAt(input: string, index: number, replacement: string) {
        if (index < 0 || index >= input.length || input.length === 0) {
            return input; // Index is out of bounds, return original string
        }

        return input.substring(0, index) + replacement + input.substring(index + 1);
    }

    export function calculateFoldedSpringLine(line: string, repetitions = 4): number {
        const springLine = prepareLine(line, repetitions);
        try {
            calculatePossibilityRanges(springLine);
        } catch (e) {
            // no ranges could be determined
            return 0;
        }
        let output = 1;
        const overlappingBlocks = splitInOverlappingSpringBlocks(springLine);
        overlappingBlocks.forEach((blockGroup, index) => {
            // console.log();
            blockGroup.forEach((springBlock) => printReplacedPiece(springLine, springBlock));

            const blockEndLineIndex = blockGroup[blockGroup.length - 1].possibleEndIndex;

            const groupPossibilities = calculatePossibilities(
                blockGroup,
                0,
                blockGroup[0].possibleStartIndex,
                springLine.line,
                blockEndLineIndex,
            );
            // console.log(groupPossibilities);
            output = output * groupPossibilities;
        });
        return output;
    }

    export function part1(lines: string[]): number {
        const map = {};
        const result = lines.reduce((t, line, index) => {
            // const start = Date.now();
            const options = calculateFoldedSpringLine(line, 0);
            map[lines[index]] = options;
            // console.log(Date.now() - start, 'ms', line);
            return t + options;
        }, 0);
        require('fs').writeFileSync('./wrong-results-12.json', JSON.stringify(map, null, 4));
        return result;
    }

    export function part2(lines: string[]): number {
        return lines.reduce((t, line) => {
            const start = Date.now();
            const options = calculateFoldedSpringLine(line);
            console.log(Date.now() - start, 'ms', options, line);
            return t + options;
        }, 0);
    }
}

if (!module.parent) {
    const path = require('path');

    const main = async () => {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day12.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day12.input'),
            false,
        );

        const start = Date.now();
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('???##?#?.##??. 5,2,1', 0), 2);
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('.??#??#?.??.# 2,2,1,1', 0), 6);
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('???#????????.???#??. 1,1,5,6', 0), 7);

        assert.equal(Y2023_Day12.calculateFoldedSpringLine('???.### 1,1,3', 0), 1);
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('.??..??...?##. 1,1,3', 0), 4);
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('?#?#?#?#?#?#?#? 1,3,1,6', 0), 1);
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('????.#...#... 4,1,1', 0), 1);
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('????.######..#####. 1,6,5', 0), 4);
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('?###???????? 3,2,1', 0), 10);
        assert.equal(Y2023_Day12.calculateFoldedSpringLine('.?.??.?#?#?.???#?? 4,2', 0), 4);

        assert.equal(Y2023_Day12.calculateFoldedSpringLine('.???#??.????#?? 6,5', 0), 3);

        assert.equal(Y2023_Day12.calculateFoldedSpringLine('.?????????? 2,2', 4), 111063614);
        assert.equal(Date.now() - start < 100, true, 'difficult exercise is taking too long');

        console.log('part 1 example start');
        assert.equal(Y2023_Day12.part1(exampleLines), 21, 'example part 1');

        // part 1
        let startMs = Date.now();
        console.log('part 1 start');
        const part1Result = Y2023_Day12.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 8193);
        // part 2
        assert.equal(Y2023_Day12.part2(exampleLines), 525152, 'example part 2');

        startMs = Date.now();
        console.log('part 2 start');
        const part2Result = Y2023_Day12.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 0);
    };

    main().catch((err) => console.error(err));
}
