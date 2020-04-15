export namespace Day5 {
    export interface ParameterOpCode {
        opCode: number;
        parameterModes: [number, number, number];
    }

    export function parseParameterOpCode(rawParameterOpCode: number): ParameterOpCode {
        let stringCode = '' + rawParameterOpCode;
        while (stringCode.length < 5) stringCode = '0' + stringCode;
        return {
            opCode: parseInt(stringCode.substr(3), 10),
            parameterModes: [
                parseInt(stringCode.substr(2, 1), 10),
                parseInt(stringCode.substr(1, 1), 10),
                parseInt(stringCode.substr(0, 1), 10),
            ]
        };
    }

    export function getExecutionParameter(codes: number[], currentIndex: number,
                                          opCode: ParameterOpCode, parameterIndex: number): number {
        const codeParameterIndex = codes[currentIndex + parameterIndex + 1];
        return opCode.parameterModes[parameterIndex] === 0 ? codes[codeParameterIndex] : codeParameterIndex;
    }

    export function executeOpCode1(codes: number[], currentIndex: number, opCode: ParameterOpCode) {
        const parameter1 = getExecutionParameter(codes, currentIndex, opCode, 0);
        const parameter2 = getExecutionParameter(codes, currentIndex, opCode, 1);
        codes[codes[currentIndex + 3]] = parameter1 + parameter2;
    }

    export function executeOpCode2(codes: number[], currentIndex: number, opCode: ParameterOpCode) {
        const parameter1 = getExecutionParameter(codes, currentIndex, opCode, 0);
        const parameter2 = getExecutionParameter(codes, currentIndex, opCode, 1);
        codes[codes[currentIndex + 3]] = parameter1 * parameter2;
    }

    export function executeOpCode3(codes: number[], currentIndex: number, opCode: ParameterOpCode, input: number) {
        codes[codes[currentIndex + 1]] = input;
    }

    export function executeOpCode4(codes: number[], currentIndex: number, opCode: ParameterOpCode): number {
        return getExecutionParameter(codes, currentIndex, opCode, 0);
    }

    export function executeTESTPart2Program(codes: number[]): number {
        let i = 0;
        const outputs = [];
        const executionCodes: {
            [opCode: string]: {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode,
                            ...args: any[]) => any, steps: number
            }
        } = {
            '1': {execution: executeOpCode1, steps: 4},
            '2': {execution: executeOpCode2, steps: 4},
            '3': {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode) => {
                    return executeOpCode3(codes, currentIndex, opCode, 5);
                }, steps: 2
            },
            '4': {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode) => {
                    outputs.push(executeOpCode4(codes, currentIndex, opCode));
                }, steps: 2
            },
            '5': {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode) => {
                    const parameter1 = getExecutionParameter(codes, currentIndex, opCode, 0);
                    const parameter2 = getExecutionParameter(codes, currentIndex, opCode, 1);
                    if (parameter1 !== 0) i = parameter2;
                }, steps: 3
            },
            '6': {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode) => {
                    const parameter1 = getExecutionParameter(codes, currentIndex, opCode, 0);
                    const parameter2 = getExecutionParameter(codes, currentIndex, opCode, 1);
                    if (parameter1 === 0) i = parameter2;
                }, steps: 3
            },
            '7': {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode) => {
                    const parameter1 = getExecutionParameter(codes, currentIndex, opCode, 0);
                    const parameter2 = getExecutionParameter(codes, currentIndex, opCode, 1);
                    codes[codes[currentIndex + 3]] = parameter1 < parameter2 ? 1 : 0;
                }, steps: 4
            },
            '8': {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode) => {
                    const parameter1 = getExecutionParameter(codes, currentIndex, opCode, 0);
                    const parameter2 = getExecutionParameter(codes, currentIndex, opCode, 1);
                    codes[codes[currentIndex + 3]] = parameter1 === parameter2 ? 1 : 0;
                }, steps: 4
            },
            '99': null,
        };
        while (i < codes.length) {
            const currentExecution = codes[i];
            const parameterOpCode = parseParameterOpCode(currentExecution);
            const execution = executionCodes['' + parameterOpCode.opCode];
            if (execution === undefined) throw new Error(`something went wrong, index: ${i} currentExecution: ${currentExecution}`);
            if (execution === null) break;
            const currentIndex = i;
            execution.execution(codes, i, parameterOpCode);
            if (i === currentIndex) i += execution.steps;
        }
        // console.log(JSON.stringify(codes));
        // console.log(JSON.stringify(outputs));
        return outputs[outputs.length - 1];
    }

    export function executeTESTProgram(codes: number[]): number {
        const outputs = [];
        let i = 0;
        const executionCodes: {
            [opCode: string]: {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode,
                            ...args: any[]) => any, steps: number
            }
        } = {
            '1': {execution: executeOpCode1, steps: 4},
            '2': {execution: executeOpCode2, steps: 4},
            '3': {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode) => {
                    return executeOpCode3(codes, currentIndex, opCode, 1);
                }, steps: 2
            },
            '4': {
                execution: (codes: number[], currentIndex: number, opCode: ParameterOpCode) => {
                    outputs.push(executeOpCode4(codes, currentIndex, opCode));
                }, steps: 2
            },
            '99': null,
        };
        while (i < codes.length) {
            const currentExecution = codes[i];
            const parameterOpCode = parseParameterOpCode(currentExecution);
            const execution = executionCodes['' + parameterOpCode.opCode];
            if (execution === undefined) throw new Error('something went wrong');
            if (execution === null) break;
            const currentIndex = i;
            execution.execution(codes, i, parameterOpCode);
            if (i === currentIndex) i += execution.steps;
        }
        return outputs[outputs.length - 1];
    }
}

if (!module.parent) {

    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_5.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        for await (const line of rl) {
            if (!line) return;
            console.log(Day5.executeTESTProgram(line.split(',').map(x => parseInt(x, 10))));
            console.log(Day5.executeTESTPart2Program(line.split(',').map(x => parseInt(x, 10))));
            // 5577461
        }
    }

    main().then(console.log).catch(err => console.error(err));
}
