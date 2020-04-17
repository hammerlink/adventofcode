import {ProgramManager} from "../manager/program.manager";

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

    export async function executeTESTPart2Program(codes: number[], input: number = 5): Promise<number> {
        const outputs = [];

        const program = new ProgramManager();
        program.intCodes = codes;
        program.getInput = async () => input;
        program.writeOutput = (output) => outputs.push(output);
        await program.executeProgram();

        return outputs[outputs.length - 1];
    }

    export async function executeTESTProgram(codes: number[]): Promise<number> {
        const outputs = [];

        const program = new ProgramManager();
        program.intCodes = codes;
        program.getInput = async () => 1;
        program.writeOutput = (output) => outputs.push(output);
        await program.executeProgram();

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
            console.log(await Day5.executeTESTProgram(line.split(',').map(x => parseInt(x, 10))));
            console.log(await Day5.executeTESTPart2Program(line.split(',').map(x => parseInt(x, 10))));
            // 5577461
        }
    }

    main().then(console.log).catch(err => console.error(err));
}
