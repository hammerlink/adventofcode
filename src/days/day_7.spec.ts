import {Day7} from "./day_7";
import {ProgramEngine} from "../engine/program.engine";
import {expect} from "chai";

describe('day 7', function () {
    describe('part 1', function () {
        it('should execute the examples correctly', function () {
            expect(Day7.searchMaximumThrusterSignal(ProgramEngine.compileProgram('3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0')))
                .to.be.equal(43210);
            expect(Day7.searchMaximumThrusterSignal(ProgramEngine.compileProgram('3,23,3,24,1002,24,10,24,1002,23,-1,23,' +
                '101,5,23,23,1,24,23,23,4,23,99,0,0')))
                .to.be.equal(54321);
            expect(Day7.searchMaximumThrusterSignal(ProgramEngine.compileProgram('3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,' +
                '1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0')))
                .to.be.equal(65210);
        });
    });
});
