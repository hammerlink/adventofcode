import {ProgramManager} from "../manager/program.manager";
import {ParameterOpCode, ProgramEngine} from "../engine/program.engine";

export namespace Day7 {
    export class Amplifier extends ProgramManager {
        initialized = false;
        phaseSetting: number;

        inputs: number[] = [];
        targetAmplifier: Amplifier;
        signalCallback: () => void;

        name: string;

        constructor(phaseSetting: number, intCodes: number[], name: string,
                    startInputs?: number[]) {
            super();
            this.phaseSetting = phaseSetting;
            this.intCodes = JSON.parse(JSON.stringify(intCodes));
            this.name = name;
            if (startInputs) this.inputs = startInputs;
        }

        // loggingEnabled = true;
        logOpcode = (opCode: ParameterOpCode) => console.log(this.name, JSON.stringify(opCode));

        getInput = async () => {
            if (!this.initialized) {
                this.initialized = true;
                return this.phaseSetting;
            }
            if (!this.inputs.length) {
                if (this.loggingEnabled) console.log(this.name, 'is waiting');
                await new Promise(((resolve, reject) => this.signalCallback = resolve));
            }
            const inputValue = this.inputs.shift();
            if (this.loggingEnabled) console.log('input', this.name, inputValue);
            return inputValue;
        }

        writeOutput = (output: number) => {
            if (this.loggingEnabled) console.log('output', this.name, output);
            this.targetAmplifier.inputs.push(output);
            if (!!this.targetAmplifier.signalCallback) this.targetAmplifier.signalCallback();
        }
    }

    export async function executeAmplifier(intCodes: number[], phaseSetting: number, input: number): Promise<number> {
        const program = new ProgramManager();
        program.intCodes = JSON.parse(JSON.stringify(intCodes));

        const inputs = [phaseSetting, input];
        let inputIndex = 0;
        program.getInput = async () => inputs[inputIndex++];
        let amplifierOutput: number = null;
        program.writeOutput = (output) => amplifierOutput = output;

        await program.executeProgram();
        return amplifierOutput;
    }

    export async function searchMaximumThrusterSignal(intCodes: number[]) {
        let maxThrusterSignal: number = null;
        for (let phaseA = 0; phaseA <= 4; phaseA++) {
            let outputA = await executeAmplifier(intCodes, phaseA, 0);
            for (let phaseB = 0; phaseB <= 4; phaseB++) {
                if (phaseB === phaseA) continue;
                let outputB = await executeAmplifier(intCodes, phaseB, outputA);
                for (let phaseC = 0; phaseC <= 4; phaseC++) {
                    if (phaseC === phaseA || phaseC === phaseB) continue;
                    let outputC = await executeAmplifier(intCodes, phaseC, outputB);
                    for (let phaseD = 0; phaseD <= 4; phaseD++) {
                        if (phaseD === phaseA || phaseD === phaseB || phaseD === phaseC) continue;
                        let outputD = await executeAmplifier(intCodes, phaseD, outputC);
                        for (let phaseE = 0; phaseE <= 4; phaseE++) {
                            if (phaseE === phaseA || phaseE === phaseB ||
                                phaseE === phaseC || phaseE === phaseD) continue;
                            let outputE = await executeAmplifier(intCodes, phaseE, outputD);
                            if (maxThrusterSignal === null || outputE > maxThrusterSignal) maxThrusterSignal = outputE;
                        }
                    }
                }
            }
        }
        return maxThrusterSignal;
    }

    export async function runFeedbackLoop(intCodes: number[], phaseSettings: number[]) {
        let lastESignal = null;
        const amplifierA: Amplifier = new Amplifier(phaseSettings[0], intCodes, 'A', [0]);
        const amplifierB: Amplifier = new Amplifier(phaseSettings[1], intCodes, 'B');
        const amplifierC: Amplifier = new Amplifier(phaseSettings[2], intCodes, 'C');
        const amplifierD: Amplifier = new Amplifier(phaseSettings[3], intCodes, 'D');
        const amplifierE: Amplifier = new Amplifier(phaseSettings[4], intCodes, 'E');
        amplifierA.targetAmplifier = amplifierB;
        amplifierB.targetAmplifier = amplifierC;
        amplifierC.targetAmplifier = amplifierD;
        amplifierD.targetAmplifier = amplifierE;
        amplifierE.targetAmplifier = amplifierA;
        amplifierE.writeOutput = (output: number) => {
            amplifierE.targetAmplifier.inputs.push(output);
            if (!!amplifierE.targetAmplifier.signalCallback) amplifierE.targetAmplifier.signalCallback();
            lastESignal = output;
        }
        await Promise.all([amplifierA, amplifierB, amplifierC, amplifierD, amplifierE].map(a => a.executeProgram()));
        return lastESignal;
    }

    export async function searchMaximumFeedbackThrusterSignal(intCodes: number[]): Promise<number> {
        let maxThrusterSignal: number = null;
        const startIndex = 5;
        const stopIndex = 9;
        for (let phaseA = startIndex; phaseA <= stopIndex; phaseA++) {
            for (let phaseB = startIndex; phaseB <= stopIndex; phaseB++) {
                if (phaseB === phaseA) continue;
                for (let phaseC = startIndex; phaseC <= stopIndex; phaseC++) {
                    if (phaseC === phaseA || phaseC === phaseB) continue;
                    for (let phaseD = startIndex; phaseD <= stopIndex; phaseD++) {
                        if (phaseD === phaseA || phaseD === phaseB || phaseD === phaseC) continue;
                        for (let phaseE = startIndex; phaseE <= stopIndex; phaseE++) {
                            if (phaseE === phaseA || phaseE === phaseB ||
                                phaseE === phaseC || phaseE === phaseD) continue;
                            const settings = [phaseA, phaseB, phaseC, phaseD, phaseE];
                            const feedbackMaxThrust = await runFeedbackLoop(intCodes, settings);
                            if (maxThrusterSignal === null || feedbackMaxThrust > maxThrusterSignal) {
                                maxThrusterSignal = feedbackMaxThrust;
                            }
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
            const result = await Day7.searchMaximumThrusterSignal(ProgramEngine.compileProgram(line));
            console.log(result);

            const part2Result = await Day7.searchMaximumFeedbackThrusterSignal(ProgramEngine.compileProgram(line));
            console.log(part2Result);
        }
    }

    main().then(console.log).catch(err => console.error(err));
}
