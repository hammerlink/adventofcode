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

    export function executeOpCode1(codes: number[], currentIndex: number, opCode: ParameterOpCode) {
        const firstPartIndex = codes[currentIndex + 1];
        const firstPart = opCode.parameterModes[0] === 0 ? codes[firstPartIndex] : firstPartIndex;
        const secondPartIndex = codes[currentIndex + 2];
        const secondPart = opCode.parameterModes[1] === 0 ? codes[secondPartIndex] : secondPartIndex;
        codes[codes[currentIndex + 3]] = firstPart + secondPart;
    }

    export function executeOpCode2(codes: number[], currentIndex: number, opCode: ParameterOpCode) {
        const firstPartIndex = codes[currentIndex + 1];
        const firstPart = opCode.parameterModes[0] === 0 ? codes[firstPartIndex] : firstPartIndex;
        const secondPartIndex = codes[currentIndex + 2];
        const secondPart = opCode.parameterModes[1] === 0 ? codes[secondPartIndex] : secondPartIndex;
        codes[codes[currentIndex + 3]] = firstPart * secondPart;
    }

    export function executeOpCode3(codes: number[], currentIndex: number, opCode: ParameterOpCode, input: number) {
        codes[codes[currentIndex + 1]] = input;
    }

    export function executeOpCode4(codes: number[], currentIndex: number, opCode: ParameterOpCode): number {
        const firstPartIndex = codes[currentIndex + 1];
        return opCode.parameterModes[0] === 0 ? codes[firstPartIndex] : firstPartIndex;
    }

    export function executeGravityAssistProgram(codes: number[]): number {
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
        let i = 0;
        while (i < codes.length) {
            const currentExecution = codes[i];
            const parameterOpCode = parseParameterOpCode(currentExecution);
            const execution = executionCodes['' + parameterOpCode.opCode];
            if (execution === undefined) throw new Error('something went wrong');
            if (execution === null) break;
            execution.execution(codes, i, parameterOpCode);
            i += execution.steps;
        }
        console.log(JSON.stringify(codes));
        console.log(JSON.stringify(outputs));
        return codes[0];
    }
}

if (!module.parent) {
    // console.log(Day5.parseParameterOpCode(12345));
    //
    // console.log(Day5.executeGravityAssistProgram('1002,4,3,4,33'.split(',').map(x => parseInt(x, 10))));
    // process.exit(0);

    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_5.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        for await (const line of rl) {
            if (!line) return;
            const codes = line.split(',').map(x => parseInt(x, 10));
            console.log(Day5.executeGravityAssistProgram(codes));
        }
    }

    main().then(console.log).catch(err => console.error(err));
}
