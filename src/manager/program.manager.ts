import {ParameterOpCode, ProgramEngine} from "../engine/program.engine";
import getExecutionParameter = ProgramEngine.getExecutionParameter;
import parseParameterOpCode = ProgramEngine.parseParameterOpCode;

export class ProgramManager {
    intCodes: number[];
    currentIndex: number = 0;
    executingFunction: (opCode: ParameterOpCode, ...args: any[]) => any;

    intCodeFunctions: {
        [opCode: string]: { execution: (opCode: ParameterOpCode, ...args: any[]) => any, steps: number }
    } = {};
    getInput: () => number;
    writeOutput: (output: number) => void;

    constructor() {
        this.intCodeFunctions['1'] = {execution: this.executeOpCode1, steps: 4};
        this.intCodeFunctions['2'] = {execution: this.executeOpCode2, steps: 4};
        this.intCodeFunctions['3'] = {execution: this.executeOpCode3, steps: 2};
        this.intCodeFunctions['4'] = {execution: this.executeOpCode4, steps: 2};
        this.intCodeFunctions['5'] = {execution: this.executeOpCode5, steps: 3};
        this.intCodeFunctions['6'] = {execution: this.executeOpCode6, steps: 3};
        this.intCodeFunctions['7'] = {execution: this.executeOpCode7, steps: 4};
        this.intCodeFunctions['8'] = {execution: this.executeOpCode8, steps: 4};
        this.intCodeFunctions['99'] = null;
    }

    executeProgram() {
        if (!this.intCodes) throw new Error('no intcodes found');
        this.currentIndex = 0;
        while (this.currentIndex < this.intCodes.length) {
            const currentExecution = this.intCodes[this.currentIndex];
            const parameterOpCode = parseParameterOpCode(currentExecution);
            const intCodeFunction = this.intCodeFunctions['' + parameterOpCode.opCode];
            if (intCodeFunction === undefined) throw new Error(`something went wrong, index: ${this.currentIndex} currentExecution: ${currentExecution}`);
            if (intCodeFunction === null) break;
            const currentStepIndex = this.currentIndex;
            this.executingFunction = intCodeFunction.execution; // make sure the class scope is used
            this.executingFunction(parameterOpCode);
            // if the current index hasn't been altered, add the steps
            if (this.currentIndex === currentStepIndex) this.currentIndex += intCodeFunction.steps;
        }
    }

    private executeOpCode1(opCode: ParameterOpCode) {
        const parameter1 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 0);
        const parameter2 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 1);
        this.intCodes[this.intCodes[this.currentIndex + 3]] = parameter1 + parameter2;
    }

    private executeOpCode2(opCode: ParameterOpCode) {
        const parameter1 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 0);
        const parameter2 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 1);
        this.intCodes[this.intCodes[this.currentIndex + 3]] = parameter1 * parameter2;
    }

    private executeOpCode3(opCode: ParameterOpCode) {
        if (!this.getInput) throw new Error('no input function found');
        this.intCodes[this.intCodes[this.currentIndex + 1]] = this.getInput();
    }

    private executeOpCode4(opCode: ParameterOpCode) {
        if (!this.writeOutput) throw new Error('no output function found');
        this.writeOutput(getExecutionParameter(this.intCodes, this.currentIndex, opCode, 0));
    }

    private executeOpCode5(opCode: ParameterOpCode) {
        const parameter1 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 0);
        const parameter2 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 1);
        if (parameter1 !== 0) this.currentIndex = parameter2;
    }

    private executeOpCode6(opCode: ParameterOpCode) {
        const parameter1 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 0);
        const parameter2 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 1);
        if (parameter1 === 0) this.currentIndex = parameter2;
    }

    private executeOpCode7(opCode: ParameterOpCode) {
        const parameter1 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 0);
        const parameter2 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 1);
        this.intCodes[this.intCodes[this.currentIndex + 3]] = parameter1 < parameter2 ? 1 : 0;
    }

    private executeOpCode8(opCode: ParameterOpCode) {
        const parameter1 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 0);
        const parameter2 = getExecutionParameter(this.intCodes, this.currentIndex, opCode, 1);
        this.intCodes[this.intCodes[this.currentIndex + 3]] = parameter1 === parameter2 ? 1 : 0;
    }
}
