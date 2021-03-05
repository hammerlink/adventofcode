import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day18 {
    // console.log(eval('2 + 2'));
    export interface Calculation {
        operation: Operation;
        parameters: Operation[];
    }

    export interface Operation {
        parameterIndex?: number;
        operation: string;
        subOperations: Operation[];
    }

    const subOperationRegex = /\([\d\+\*\s\_]+\)/;
    export function parseInput(line: string): Calculation {
        const calculation: Calculation = {
            operation: null,
            parameters: [],
        };
        let parsedLine = line;
        while (parsedLine.match(subOperationRegex)) {
            const match = parsedLine.match(subOperationRegex);
            const subOperation: Operation = {
                parameterIndex: calculation.parameters.length,
                operation: match[0].replace(/[\(\)]/g, ''),
                subOperations: [],
            };
            calculation.parameters.push(subOperation);
            parsedLine = parsedLine.replace(match[0], `_${subOperation.parameterIndex}`);
        }
        calculation.operation = {
            operation: parsedLine,
            subOperations: [],
        };
        buildOperation(calculation, calculation.operation);
        return calculation;
    }

    export function buildOperation(calculation: Calculation, operation: Operation) {
        const subOperations = operation.operation.match(/_\d+/g);
        if (!subOperations) return;
        operation.subOperations = subOperations.map(x => {
            const parameterIndex = parseInt(x.replace('_', ''), 10);
            const subOperation = calculation.parameters.find(p => p.parameterIndex === parameterIndex);
            if (!subOperation) throw new Error(`didnt find ${x} ${JSON.stringify(operation)}`);
            return subOperation;
        });

        operation.subOperations.forEach(subOperation => buildOperation(calculation, subOperation));
    }

    export function solveOperation(operation: Operation): number {
        let operationLine = operation.operation;
        operation.subOperations.forEach(subOperation => {
            const result = solveOperation(subOperation);
            operationLine = operationLine.replace(`_${subOperation.parameterIndex}`, '' + result);
        });

        const nextEvalRegex = /\d+\s[\*\+]\s\d+/;
        while (operationLine.match(nextEvalRegex)) {
            const nextEval = operationLine.match(nextEvalRegex);
            const result = eval(nextEval[0]);
            operationLine = operationLine.replace(nextEval[0], result);
        }
        return parseInt(operationLine, 10);
    }

    export function solveCalculation(line: string, withPrioritization = false): number {
        const calculation = parseInput(line);
        return !withPrioritization ? solveOperation(calculation.operation) : solveOperationPart2(calculation.operation);
    }

    export function solveOperationPart2(operation: Operation): number {
        let operationLine = operation.operation;
        operation.subOperations.forEach(subOperation => {
            const result = solveOperationPart2(subOperation);
            operationLine = operationLine.replace(`_${subOperation.parameterIndex}`, '' + result);
        });

        const nextEvalRegexPlus = /\d+\s[\+]\s\d+/;
        while (operationLine.match(nextEvalRegexPlus)) {
            const nextEval = operationLine.match(nextEvalRegexPlus);
            const result = eval(nextEval[0]);
            operationLine = operationLine.replace(nextEval[0], result);
        }
        const nextEvalRegexTimes = /\d+\s[\*]\s\d+/;
        while (operationLine.match(nextEvalRegexTimes)) {
            const nextEval = operationLine.match(nextEvalRegexTimes);
            const result = eval(nextEval[0]);
            operationLine = operationLine.replace(nextEval[0], result);
        }

        return parseInt(operationLine, 10);
    }

    export function part1(lines: string[]): number {
        let total = 0;
        lines.forEach(line => total += solveCalculation(line));
        return total;
    }

    export function part2(lines: string[]): number {
        let total = 0;
        lines.forEach(line => total += solveCalculation(line, true));
        return total;
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        assert.strictEqual(Y2020_Day18.solveCalculation(`1 + (2 * 3) + (4 * (5 + 6))`), 51, 'example 1 part 1');
        assert.strictEqual(Y2020_Day18.solveCalculation(`1 + 2 * 3 + 4 * 5 + 6`), 71, 'example 1 part 1');
        assert.strictEqual(Y2020_Day18.solveCalculation(`2 * 3 + (4 * 5)`), 26, 'example 1 part 1');
        assert.strictEqual(Y2020_Day18.solveCalculation(`5 + (8 * 3 + 9 + 3 * 4 * 3)`), 437, 'example 1 part 1');
        assert.strictEqual(Y2020_Day18.solveCalculation(`5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))`), 12240, 'example 1 part 1');
        assert.strictEqual(Y2020_Day18.solveCalculation(`((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2`), 13632, 'example 1 part 1');

        // assert.strictEqual(Y2020_Day18.part2(exampleLines), 1, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day18.input'), false);
        // part 1
        const part1Result = Y2020_Day18.part1(lines);
        console.log(part1Result);

        assert.strictEqual(Y2020_Day18.solveCalculation(`1 + 2 * 3 + 4 * 5 + 6`, true), 231, 'example 1 part 2');
        assert.strictEqual(Y2020_Day18.solveCalculation(`1 + (2 * 3) + (4 * (5 + 6))`, true), 51, 'example 1 part 2');
        assert.strictEqual(Y2020_Day18.solveCalculation(`2 * 3 + (4 * 5)`, true), 46, 'example 1 part 2');
        assert.strictEqual(Y2020_Day18.solveCalculation(`5 + (8 * 3 + 9 + 3 * 4 * 3)`, true), 1445, 'example 1 part 2');
        assert.strictEqual(Y2020_Day18.solveCalculation(`5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))`, true), 669060, 'example 1 part 2');
        assert.strictEqual(Y2020_Day18.solveCalculation(`((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2`, true), 23340, 'example 1 part 2');

        // part 2
        const part2Result = Y2020_Day18.part2(lines);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
