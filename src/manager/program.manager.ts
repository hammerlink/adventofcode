import {ParameterOpCode, ProgramEngine} from "../engine/program.engine";
import parseParameterOpCode = ProgramEngine.parseParameterOpCode;

export class ProgramManager {
    intCodes: number[];
    currentIndex: number = 0;
    currentRelativeBase: number = 0;
    executingFunction: (opCode: ParameterOpCode, ...args: any[]) => Promise<any>;

    intCodeFunctions: {
        [opCode: string]: { execution: (opCode: ParameterOpCode, ...args: any[]) => Promise<any>, steps: number }
    } = {};
    getInput: () => Promise<number>;
    writeOutput: (output: number) => void;

    loggingEnabled = false;
    logOpcode = (opCode: ParameterOpCode) => console.log(JSON.stringify(opCode));

    constructor(intCodes?: number[]) {
        if (intCodes) this.intCodes = JSON.parse(JSON.stringify(intCodes));
        this.intCodeFunctions['1'] = {execution: this.executeOpCode1, steps: 4};
        this.intCodeFunctions['2'] = {execution: this.executeOpCode2, steps: 4};
        this.intCodeFunctions['3'] = {execution: this.executeOpCode3, steps: 2};
        this.intCodeFunctions['4'] = {execution: this.executeOpCode4, steps: 2};
        this.intCodeFunctions['5'] = {execution: this.executeOpCode5, steps: 3};
        this.intCodeFunctions['6'] = {execution: this.executeOpCode6, steps: 3};
        this.intCodeFunctions['7'] = {execution: this.executeOpCode7, steps: 4};
        this.intCodeFunctions['8'] = {execution: this.executeOpCode8, steps: 4};
        this.intCodeFunctions['9'] = {execution: this.executeOpCode9, steps: 2};
        this.intCodeFunctions['99'] = null;
    }

    async executeProgram() {
        if (!this.intCodes) throw new Error('no intcodes found');
        this.currentIndex = 0;
        while (this.currentIndex < this.intCodes.length) {
            const currentExecution = this.getIntCode(this.currentIndex);
            const parameterOpCode = parseParameterOpCode(currentExecution);
            const intCodeFunction = this.intCodeFunctions['' + parameterOpCode.opCode];
            if (intCodeFunction === undefined) throw new Error(`something went wrong, index: ${this.currentIndex} currentExecution: ${currentExecution}`);
            if (intCodeFunction === null) break;
            const currentStepIndex = this.currentIndex;
            this.executingFunction = intCodeFunction.execution; // make sure the class scope is used
            if (this.loggingEnabled) this.logOpcode(parameterOpCode);
            await this.executingFunction(parameterOpCode);
            // if the current index hasn't been altered, add the steps
            if (this.currentIndex === currentStepIndex) this.currentIndex += intCodeFunction.steps;
        }
    }

    private getIntCode(index: number): number {
        if (this.intCodes[index] === undefined) this.intCodes[index] = 0;
        return this.intCodes[index];
    }

    private writeIntCodeValue(opCode: ParameterOpCode, parameterIndex: number, value: number) {
        const parameterMode = opCode.parameterModes[parameterIndex];
        const parameterIntCode = this.getIntCode(this.currentIndex + parameterIndex + 1);
        if (parameterMode === 0) {
            this.intCodes[parameterIntCode] = value;
        } else if (parameterMode === 2) {
            this.intCodes[this.currentRelativeBase + parameterIntCode] = value;
        }
    }

    private getIntCodeValueWithOpCode(opCode: ParameterOpCode, parameterIndex: number): number {
        const parameterMode = opCode.parameterModes[parameterIndex];
        const parameterIntCode = this.getIntCode(this.currentIndex + parameterIndex + 1);
        if (parameterMode === 0) return this.getIntCode(parameterIntCode);
        if (parameterMode === 1) return parameterIntCode;
        if (parameterMode === 2) return this.getIntCode(this.currentRelativeBase + parameterIntCode);
    }

    private async executeOpCode1(opCode: ParameterOpCode) {
        const parameter1 = this.getIntCodeValueWithOpCode(opCode, 0);
        const parameter2 = this.getIntCodeValueWithOpCode(opCode, 1);
        this.writeIntCodeValue(opCode, 2, parameter1 + parameter2);
    }

    private async executeOpCode2(opCode: ParameterOpCode) {
        const parameter1 = this.getIntCodeValueWithOpCode(opCode, 0);
        const parameter2 = this.getIntCodeValueWithOpCode(opCode, 1);
        this.writeIntCodeValue(opCode, 2, parameter1 * parameter2);
    }

    private async executeOpCode3(opCode: ParameterOpCode) {
        if (!this.getInput) throw new Error('no input function found');
        this.writeIntCodeValue(opCode, 0, await this.getInput());
    }

    private async executeOpCode4(opCode: ParameterOpCode) {
        if (!this.writeOutput) throw new Error('no output function found');
        this.writeOutput(this.getIntCodeValueWithOpCode(opCode, 0));
    }

    private async executeOpCode5(opCode: ParameterOpCode) {
        const parameter1 = this.getIntCodeValueWithOpCode(opCode, 0);
        const parameter2 = this.getIntCodeValueWithOpCode(opCode, 1);
        if (parameter1 !== 0) this.currentIndex = parameter2;
    }

    private async executeOpCode6(opCode: ParameterOpCode) {
        const parameter1 = this.getIntCodeValueWithOpCode(opCode, 0);
        const parameter2 = this.getIntCodeValueWithOpCode(opCode, 1);
        if (parameter1 === 0) this.currentIndex = parameter2;
    }

    private async executeOpCode7(opCode: ParameterOpCode) {
        const parameter1 = this.getIntCodeValueWithOpCode(opCode, 0);
        const parameter2 = this.getIntCodeValueWithOpCode(opCode, 1);
        this.writeIntCodeValue(opCode, 2, parameter1 < parameter2 ? 1 : 0);
    }

    private async executeOpCode8(opCode: ParameterOpCode) {
        const parameter1 = this.getIntCodeValueWithOpCode(opCode, 0);
        const parameter2 = this.getIntCodeValueWithOpCode(opCode, 1);
        this.writeIntCodeValue(opCode, 2, parameter1 === parameter2 ? 1 : 0);
    }

    private async executeOpCode9(opCode: ParameterOpCode) {
        const parameter1 = this.getIntCodeValueWithOpCode(opCode, 0);
        this.currentRelativeBase += parameter1;
    }
}
