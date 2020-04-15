export namespace Day2 {
    export function executeOpCode1(codes: number[], currentIndex: number): number[] {
        const firstPartIndex = codes[currentIndex + 1];
        const firstPart = codes[firstPartIndex];
        const secondPartIndex = codes[currentIndex + 2];
        const secondPart = codes[secondPartIndex];
        const outputIndex = codes[currentIndex + 3];
        codes[outputIndex] = firstPart + secondPart;
        return codes;
    }

    export function executeOpCode2(codes: number[], currentIndex: number): number[] {
        const firstPartIndex = codes[currentIndex + 1];
        const firstPart = codes[firstPartIndex];
        const secondPartIndex = codes[currentIndex + 2];
        const secondPart = codes[secondPartIndex];
        const outputIndex = codes[currentIndex + 3];
        codes[outputIndex] = firstPart * secondPart;
        return codes;
    }

    export function customInitialization(codes: number[]): number[] {
        codes[1] = 12;
        codes[2] = 2;
        return codes;
    }

    const executionCodes = {'1': executeOpCode1, '2': executeOpCode2, '99': null};

    export function executeGravityAssistProgram(codes: number[], customInitializationRequired: boolean = false): number {
        if (customInitializationRequired) codes = customInitialization(codes);
        for (let i = 0; i < codes.length; i = i + 4) {
            const currentExecution = codes[i];
            const execution = executionCodes['' + currentExecution];
            if (execution === undefined) throw new Error('something went wrong');
            if (execution === null) break;
            codes = execution(codes, i);
        }
        return codes[0];
    }

    export function searchProgramResult(codes: number[], result: number): number {
        for (let noun = 0; noun <= 99; noun++) {
            for (let verb = 0; verb <= 99; verb++) {
                const customCodes = JSON.parse(JSON.stringify(codes));
                customCodes[1] = noun;
                customCodes[2] = verb;
                const customResult = executeGravityAssistProgram(customCodes, false);
                if (result === customResult) return 100 * noun + verb;
            }
        }
    }

    export function compileProgram(input: string): number[] {
        return input.split(',').map(x => parseInt(x, 10));
    }

    export function executeExamples() {
        console.log(Day2.executeGravityAssistProgram(Day2.compileProgram('1,0,0,0,99'), false));
        console.log(Day2.executeGravityAssistProgram(Day2.compileProgram('2,3,0,3,99'), false));
        console.log(Day2.executeGravityAssistProgram(Day2.compileProgram('2,4,4,5,99,0'), false));
        console.log(Day2.executeGravityAssistProgram(Day2.compileProgram('1,1,1,4,99,5,6,0,99'), false));
        process.exit(0);
    }
}

if (!module.parent) {
    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_2.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        for await (const line of rl) {
            if (!line) return;
            const program = Day2.compileProgram(line);
            console.log(Day2.searchProgramResult(program, 19690720));
        }
    }

    main().then(console.log).catch(err => console.error(err));
}
