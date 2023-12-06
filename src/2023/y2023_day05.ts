import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

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
        executedRanges?: Range[];
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

        return {fromType, toType, transformers};
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
        return {seeds, stages};
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
        const {seeds, stages} = parseInput(lines);
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
        if (aStart <= b.start && aStop >= b.start) return true;
        if (aStart <= b.stop && aStop >= b.stop) return true;
        return false;
    }

    function getRangeIntersection(a: Range, b: Range): Range | null {
        const maxStart = a.start > b.start ? a.start : b.start;
        const minStop = a.stop < b.stop ? a.stop : b.stop;
        if (maxStart >= minStop) return null;
        return {start: maxStart, stop: minStop};
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
        return {start, stop};
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
            if (stop < baseRange.stop) output.push({start, stop});
        }
        if (baseRange.stop > cutoutRange.stop && baseRange.stop > cutoutRange.start) {
            const start = cutoutRange.stop;
            const stop = baseRange.stop;
            if (start > baseRange.start) output.push({start, stop});
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
            addRangeToRanges(ranges, {...ranges[i]});
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
        });
    }

    function getTransformerFromRange(fromStart: number, length: number): Range {
        return {
            start: fromStart,
            stop: fromStart + length - 1,
        };
    }

    function splitInputRanges(
        input: Range[],
        stage: Stage,
    ): { unaffectedRanges: Range[]; affectedRanges: { range: Range; transformer: StageTransformer }[] } {
        const affectedRanges: { range: Range; transformer: StageTransformer }[] = [];
        const unaffectedRanges: Range[] = [];

        input.forEach((range) => {
            const matchingTransformers = stage.transformers.filter((x) => hasRangeOverlap(x.fromRange, range, -1)); // -1 ensures hard overlap, not just equal value
            if (!matchingTransformers) {
                unaffectedRanges.push(range);
                return;
            }

            let remainingRanges = [range];
            matchingTransformers.forEach(transformer => {
                const fromIntersection = getRangeIntersection(transformer.fromRange, range);
                affectedRanges.push({range: fromIntersection, transformer});
                remainingRanges = removeRangeOutRanges(remainingRanges, fromIntersection);
            });
            unaffectedRanges.push(...remainingRanges);
        });

        return {unaffectedRanges, affectedRanges};
    }

    export function part2(lines: string[]): number {
        const {seeds: rawSeeds, stages} = parseInput(lines);
        let ranges: { start: number; stop: number }[] = [];
        for (let i = 0; i < rawSeeds.length; i += 2) {
            const start = rawSeeds[i];
            const rangeValue = rawSeeds[i + 1];
            const range = {start, stop: start + rangeValue - 1};
            ranges.push(range);
        }
        cleanUpRanges(ranges);
        stages.forEach((stage) => {
            const {unaffectedRanges, affectedRanges} = splitInputRanges(ranges, stage);
            ranges = [
                ...unaffectedRanges,
                ...affectedRanges.map((x) =>
                    projectIntersection(x.transformer.fromRange, x.range, x.transformer.toRange),
                ),
            ];
            cleanUpRanges(ranges);
        });
        return ranges[0].start;
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
        assert.equal(part2Result, 125742456);
    }

    main().catch((err) => console.error(err));
}
