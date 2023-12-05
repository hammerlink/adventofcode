import { FileEngine } from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2023_Day05 {
    export type StageTransformer = {
        fromStart: number;
        toStart: number;
        range: number;
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
            const range = parseInt(pieces[2]);
            transformers.push({ fromStart, toStart, range });
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
                (transformer) => value >= transformer.fromStart && value < transformer.fromStart + transformer.range,
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

    export function part2(lines: string[]): number {
        const { seeds: rawSeeds, stages } = parseInput(lines);
        let lowest: number | undefined;
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
