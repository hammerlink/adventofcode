import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';
import { from } from 'rxjs';

export namespace Y2023_Day05 {
    export type StageTransformer = {
        fromStart: number;
        toStart: number;
        length: number;
        fromRange: Range;
        toRange: Range;
        stageRangeMap: {
            [stage: string]: Range[];
        };
    };
    export type Stage = {
        fromType: string;
        toType: string;
        transformers: StageTransformer[];
    };
    function parseStage(lines: string[]): Stage {
        const firstPieces = lines[0].split(' ')[0].split('-to-');
        const fromType = firstPieces[0];
        const toType = firstPieces[1];
        const transformers: StageTransformer[] = [];
        for (let i = 1; i < lines.length; i++) {
            const pieces = lines[i].split(' ');
            const toStart = parseInt(pieces[0]);
            const fromStart = parseInt(pieces[1]);
            const length = parseInt(pieces[2]);
            const transformer: StageTransformer = {
                fromStart,
                toStart,
                length,
                fromRange: getTransformerFromRange(fromStart, length),
                toRange: getTransformerFromRange(toStart, length),
                stageRangeMap: {},
            };
            transformers.push(transformer);
        }

        return { fromType, toType, transformers };
    }
    export function parseInput(lines: string[]): { seeds: number[]; stages: Stage[] } {
        const seeds = Array.from(lines[0].matchAll(/\d+/g)).map((x) => parseInt(x[0]));
        const stages: Stage[] = [];
        let stageLines: string[] = [];
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i];
            if (line?.length) {
                stageLines.push(line);
            } else {
                if (stageLines.length) stages.push(parseStage(stageLines));
                stageLines = [];
            }
        }
        if (stageLines.length) stages.push(parseStage(stageLines));
        return { seeds, stages };
    }
    function executeStage(stage: Stage, input: number[]): number[] {
        return input.map((value) => {
            const matchingTransformer = stage.transformers.find(
                (transformer) => value >= transformer.fromStart && value < transformer.fromStart + transformer.length,
            );
            if (matchingTransformer) {
                const delta = value - matchingTransformer.fromStart;
                return matchingTransformer.toStart + delta;
            }
            return value;
        });
    }
    function getLocationFromSeed(stages: Stage[], seed: number): number {
        let value = seed;
        stages.forEach((stage) => {
            value = executeStage(stage, [value])[0];
        });
        return value;
    }

    export function part1(lines: string[]): number {
        const { seeds, stages } = parseInput(lines);
        const stageMap: { [stage: string]: number[] } = {};
        stageMap.seed = seeds;
        let currentInput = [...seeds];
        stages.forEach((stage) => {
            const stageOutput = executeStage(stage, currentInput);
            stageMap[stage.toType] = [...stageOutput];
            currentInput = stageOutput;
        });
        return currentInput.reduce((t, v) => (v < t ? v : t), currentInput[0]);
    }

    type Range = { start: number; stop: number };
    function hasRangeOverlap(a: Range, b: Range, extraDelta = 0): boolean {
        const aStart = a.start - extraDelta;
        const aStop = a.stop + extraDelta;
        if (b.start <= aStart && b.stop >= aStart) return true;
        if (b.start <= aStop && b.stop >= aStop) return true;
        return false;
    }
    function getRangeIntersection(a: Range, b: Range): Range | null {
        const maxStart = a.start > b.start ? a.start : b.start;
        const minStop = a.stop < b.stop ? a.stop : b.stop;
        if (maxStart >= minStop) return null;
        return { start: maxStart, stop: minStop };
    }
    function projectIntersection(original: Range, intersection: Range, target: Range): Range {
        const start = target.start + (intersection.start - original.start);
        return <Range>{
            start,
            stop: start + (intersection.stop - intersection.start),
        };
    }
    function mergeRanges(a: Range, b: Range): Range {
        const start = a.start < b.start ? a.start : b.start;
        const stop = a.stop > b.stop ? a.stop : b.stop;
        return { start, stop };
    }
    function removeRangeOutRanges(ranges: Range[], removeRange: Range): Range[] {
        const output: Range[] = [];
        ranges.forEach((range) => {
            output.push(...removeRangeFromRange(range, removeRange));
        });
        output.sort((a, b) => a.start - b.start);
        return output;
    }
    function removeRangeFromRange(baseRange: Range, cutoutRange: Range): Range[] {
        const output: Range[] = [];

        // cutout completely overlaps range, completely remove range
        if (cutoutRange.start <= baseRange.start && cutoutRange.stop >= baseRange.stop) return [];

        if (baseRange.start < cutoutRange.start && cutoutRange.stop > baseRange.start) {
            const start = baseRange.start;
            const stop = cutoutRange.start;
            if (stop < baseRange.stop) output.push({ start, stop });
        }
        if (baseRange.stop > cutoutRange.stop && baseRange.stop > cutoutRange.start) {
            const start = cutoutRange.stop;
            const stop = baseRange.stop;
            if (start > baseRange.start) output.push({ start, stop });
        }
        // nothing has been cutout -> no intersection
        if (!output.length) return [baseRange];

        return output;
    }
    function addRangeToRanges(baseRanges: Range[], range: Range) {
        let matchingIndex = baseRanges.findIndex((x) => x !== range && hasRangeOverlap(x, range));
        if (matchingIndex !== -1) {
            do {
                // after merge we need to recheck if it can be merged with another
                const matchingRange = baseRanges.splice(matchingIndex, 1)[0];
                range = mergeRanges(matchingRange, range);
                matchingIndex = baseRanges.findIndex((x) => x !== range && hasRangeOverlap(x, range));
            } while (matchingIndex !== -1);
        }
        baseRanges.push(range);
    }
    function cleanUpRanges(ranges: Range[]) {
        ranges.sort((a, b) => a.start - b.start);
        for (let i = 0; i < ranges.length; i++) {
            addRangeToRanges(ranges, { ...ranges[i] });
            ranges.sort((a, b) => a.start - b.start);
        }
    }
    function calculateEntryRanges(
        transformer: StageTransformer,
        previousStage: Stage,
        startingRanges: Range[],
        allStages: Stage[],
    ) {
        let remainingRanges: Range[] = startingRanges;

        // calculate if direct fromRanges can pass through the transformer layer of the previous stage
        startingRanges.forEach((validRange) => {
            previousStage.transformers
                .filter((x) => hasRangeOverlap(validRange, x.fromRange))
                .forEach((x) => {
                    const fromIntersection = getRangeIntersection(validRange, x.fromRange);
                    if (fromIntersection === null) return;
                    const projectedToRange = projectIntersection(x.fromRange, fromIntersection, x.toRange);
                    const toIntersection = getRangeIntersection(validRange, projectedToRange);
                    let removeRanges: Range[] = [fromIntersection];
                    if (toIntersection !== null) {
                        const projectedFromRange = projectIntersection(x.toRange, toIntersection, x.fromRange);
                        removeRanges = removeRangeOutRanges(removeRanges, projectedFromRange);
                    }
                    // remove intersection pieces that lead to a good output
                    removeRanges.forEach((rangeToRemove) => {
                        remainingRanges = removeRangeOutRanges(remainingRanges, rangeToRemove);
                    });
                });
        });

        // calculate if you can transform into the correct range via a transformer layer
        startingRanges.forEach((validRange) => {
            previousStage.transformers
                .filter((x) => hasRangeOverlap(validRange, x.toRange))
                .forEach((x) => {
                    const toIntersection = getRangeIntersection(validRange, x.toRange);
                    if (toIntersection === null) return;
                    const projectedFromRange = projectIntersection(x.toRange, toIntersection, x.fromRange);
                    addRangeToRanges(remainingRanges, projectedFromRange);
                });
        });

        cleanUpRanges(remainingRanges);
        transformer.stageRangeMap[previousStage.toType] = remainingRanges;
        const nextPreviousStage = allStages.find((x) => x.toType === previousStage.fromType);
        if (nextPreviousStage) calculateEntryRanges(transformer, nextPreviousStage, remainingRanges, allStages);
    }
    function calculatePreviousStageRanges(currentStage: Stage, previousStage: Stage, allStages: Stage[]) {
        currentStage.transformers.forEach((transformer) => {
            calculateEntryRanges(transformer, previousStage, [transformer.fromRange], allStages);
            // const fromRange = transformer.fromRange;
            // transformer.stageRangeMap[previousStage.toType] = previousStage.transformers
            //     .filter((x) => hasRangeOverlap(x.toRange, fromRange))
            //     .map((x) => {
            //         // TODO CHECK FOR PIECES THAT CAN BE REMOVED
            //         // TRY TO CALCULATE WHAT ACTUAL VALUES CAN GET YOU IN THIS STAGE
            //         const intersectionRange = getRangeIntersection(x.toRange, fromRange);
            //         if (intersectionRange === null) return null;
            //         const start = x.fromRange.start + (intersectionRange.start - x.toRange.start);
            //         return <Range>{
            //             start,
            //             stop: start + (intersectionRange.stop - intersectionRange.start),
            //         };
            //     })
            //     .filter((x) => x !== null)
            //     .sort((a, b) => a.start - b.start);
            // if (!transformer.stageRangeMap[previousStage.toType].length)
            //     transformer.stageRangeMap[previousStage.toType] = [fromRange];
            // // check all previous stages
            // // check all transformers of previous stage
        });
    }
    function getTransformerFromRange(fromStart: number, length: number): Range {
        return {
            start: fromStart,
            stop: fromStart + length - 1,
        };
    }

    export function part2(lines: string[]): number {
        const { seeds: rawSeeds, stages } = parseInput(lines);
        let lowest: number | undefined;
        calculatePreviousStageRanges(stages[stages.length - 1], stages[stages.length - 2], stages);
        // stages.forEach((stage, index) => {
        //     console.log('checking stage', stage.fromType, '->', stage.toType);
        //     stage.transformers.sort((a, b) => a.toStart - b.toStart);
        //     const ranges: Range[] = stage.transformers.map((x) => ({
        //         start: x.fromStart,
        //         stop: x.fromStart + x.length - 1,
        //     }));
        //     // stage.ranges = ranges;
        //     if (index > 0) calculatePreviousStageRanges(stage, stages[index - 1], stages);
        // });
        console.log(JSON.stringify(stages, null, 4));
        return 0;
        // create a range of ideal ranges
        // reverse engineer stages?
        // redefine ranges, remove overlapping areas
        const ranges: { start: number; stop: number }[] = [];
        for (let i = 0; i < rawSeeds.length; i += 2) {
            const start = rawSeeds[i];
            const rangeValue = rawSeeds[i + 1];
            const range = { start, stop: start + rangeValue - 1 };
            let canBeAdded = true;
            ranges.forEach((otherRange) => {
                if (!canBeAdded) return;
                if (otherRange.start <= range.start && otherRange.stop >= range.stop) {
                    canBeAdded = false;
                    return;
                }
                if (otherRange.start < range.start && otherRange.stop > range.start) {
                    range.start = otherRange.stop + 1;
                    console.log('slicing start', range);
                }
                if (otherRange.start < range.stop && otherRange.stop > range.stop) {
                    range.stop = otherRange.start - 1;
                    console.log('slicing stop', range);
                }
            });
            // remove overlap
            if (canBeAdded && range.start < range.stop) ranges.push(range);
            else console.log('skipping', range);
        }
        const seedMap: { [seed: number]: null } = {};
        for (let i = 0; i < rawSeeds.length; i += 2) {
            const start = rawSeeds[i];
            const range = rawSeeds[i + 1];
            for (let x = 0; x < range; x++) {
                const seed = start + x;
                if (seedMap[seed] === null) continue;
                const location = getLocationFromSeed(stages, start + x);
                if (lowest === undefined || location < lowest) lowest = location;
                seedMap[seed] === null;
            }
        }
        return lowest;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day05.example'),
            false,
        );
        const lines = await FileEngine.readFileToLines(
            path.join(path.dirname(__filename), './data/y2023_day05.input'),
            false,
        );

        assert.equal(Y2023_Day05.part1(exampleLines), 35, 'example 1 part 1');

        // part 1
        let startMs = Date.now();
        const part1Result = Y2023_Day05.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);
        assert.equal(part1Result, 196167384);

        // part 2
        assert.equal(Y2023_Day05.part2(exampleLines), 46, 'example 1 part 2');

        startMs = Date.now();
        const part2Result = Y2023_Day05.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
        // assert.equal(part2Result, 592158);
    }

    main().catch((err) => console.error(err));
}
