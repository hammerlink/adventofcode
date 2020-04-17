import {ProgramManager} from "../manager/program.manager";
import {expect} from "chai";

describe('day 9', function () {
    describe('part 1', function () {
        it('should execute example programs with parameter mode 3', async function () {
            const intCodes = [109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99];
            const program = new ProgramManager(intCodes);
            const output = [];
            program.writeOutput = (item) => output.push(item);
            await program.executeProgram();
            expect(JSON.stringify(intCodes)).to.equal(JSON.stringify(output));
        });

        it('should execute programs with large digits', async function () {
            let program = new ProgramManager([1102, 34915192, 34915192, 7, 4, 7, 99, 0]);
            const outputs = [];
            program.writeOutput = (item) => outputs.push(item);
            await program.executeProgram();
            expect(outputs.length).to.equal(1);
            expect(('' + outputs[0]).length).to.equal(16);

            program = new ProgramManager([104, 1125899906842624, 99]);
            program.writeOutput = (item) => expect(item).to.equal(1125899906842624);
        });
    });
});
