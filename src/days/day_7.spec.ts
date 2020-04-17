import {Day7} from "./day_7";
import {ProgramEngine} from "../engine/program.engine";
import {expect} from "chai";

describe('day 7', function () {
    describe('part 1', function () {
        it('should execute the examples correctly', async function () {
            expect(await Day7.searchMaximumThrusterSignal(ProgramEngine.compileProgram('3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0')))
                .to.be.equal(43210);
            expect(await Day7.searchMaximumThrusterSignal(ProgramEngine.compileProgram('3,23,3,24,1002,24,10,24,1002,23,-1,23,' +
                '101,5,23,23,1,24,23,23,4,23,99,0,0')))
                .to.be.equal(54321);
            expect(await Day7.searchMaximumThrusterSignal(ProgramEngine.compileProgram('3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,' +
                '1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0')))
                .to.be.equal(65210);
        });
    });

    function exampleProgram(phaseSetting: number, getInput: () => number, writeOutput: (number) => void) {
        for (let i = 0; i < 5; i++) {
            let input = getInput();
            input = input * 2;
            input += phaseSetting;
            writeOutput(input);
        }
    }

    describe('part 2', function () {
        const exampleIntCodes1 = [3, 26, 1001, 26, -4, 26, 3, 27, 1002, 27, 2, 27, 1, 27, 26, 27, 4, 27, 1001, 28, -1, 28, 1005, 28, 6, 99, 0, 0, 5];
        const exampleSettings1 = [9, 8, 7, 6, 5];

        const exampleIntCodes2 = [3, 52, 1001, 52, -5, 52, 3, 53, 1, 52, 56, 54, 1007, 54, 5, 55, 1005, 55, 26, 1001, 54,
            -5, 54, 1105, 1, 12, 1, 53, 54, 53, 1008, 54, 0, 55, 1001, 55, 1, 55, 2, 53, 55, 53, 4,
            53, 1001, 56, -1, 56, 1005, 56, 6, 99, 0, 0, 0, 0, 10];
        const exampleSettings2 = [9, 7, 8, 5, 6];

        it('should execute the feedbackloop correctly', async function () {
            this.timeout(60000);
            expect(await Day7.runFeedbackLoop(exampleIntCodes1, exampleSettings1)).to.be.equal(139629729);
            expect(await Day7.runFeedbackLoop(exampleIntCodes2, exampleSettings2)).to.be.equal(18216);
        });

        it('should find the best feedback output', async function () {
            expect(await Day7.searchMaximumFeedbackThrusterSignal(exampleIntCodes2)).to.be.equal(18216);
            expect(await Day7.searchMaximumFeedbackThrusterSignal(exampleIntCodes1)).to.be.equal(139629729);

        });
    });
});
