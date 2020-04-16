import {ProgramManager} from "../manager/program.manager";
import {ProgramEngine} from "../engine/program.engine";

export namespace Day7 {
    export function executeAmplifier(intCodes: number[], phaseSetting: number, input: number): number {
        const program = new ProgramManager();
        program.intCodes = JSON.parse(JSON.stringify(intCodes));

        const inputs = [phaseSetting, input];
        let inputIndex = 0;
        program.getInput = () => inputs[inputIndex++];
        let amplifierOutput: number = null;
        program.writeOutput = (output) => amplifierOutput = output;

        program.executeProgram();
        return amplifierOutput;
    }

    export function searchMaximumThrusterSignal(intCodes: number[]) {
        let maxThrusterSignal: number = null;
        for (let phaseA = 0; phaseA <= 4; phaseA++) {
            let outputA = executeAmplifier(intCodes, phaseA, 0);
            for (let phaseB = 0; phaseB <= 4; phaseB++) {
                if (phaseB === phaseA) continue;
                let outputB = executeAmplifier(intCodes, phaseB, outputA);
                for (let phaseC = 0; phaseC <= 4; phaseC++) {
                    if (phaseC === phaseA || phaseC === phaseB) continue;
                    let outputC = executeAmplifier(intCodes, phaseC, outputB);
                    for (let phaseD = 0; phaseD <= 4; phaseD++) {
                        if (phaseD === phaseA || phaseD === phaseB || phaseD === phaseC) continue;
                        let outputD = executeAmplifier(intCodes, phaseD, outputC);
                        for (let phaseE = 0; phaseE <= 4; phaseE++) {
                            if (phaseE === phaseA || phaseE === phaseB ||
                                phaseE === phaseC || phaseE === phaseD) continue;
                            let outputE = executeAmplifier(intCodes, phaseE, outputD);
                            if (maxThrusterSignal === null || outputE > maxThrusterSignal) maxThrusterSignal = outputE;
                        }
                    }
                }
            }
        }

        return maxThrusterSignal;
    }
}

if (!module.parent) {
    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_7.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        for await (const line of rl) {
            if (!line) return;
            const result = Day7.searchMaximumThrusterSignal(ProgramEngine.compileProgram(line));
            console.log(result);
        }
    }

    main().then(console.log).catch(err => console.error(err));
}
