import {Day5} from "./day_5";
import {ProgramEngine} from "../engine/program.engine";
import {expect} from "chai";

describe('advent of code, day 5', function () {
    it('should execute example position mode programs', function () {
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,9,8,9,10,9,4,9,99,-1,8'), 1))
            .to.be.equal(0);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,9,8,9,10,9,4,9,99,-1,8'), 8))
            .to.be.equal(1);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,9,8,9,10,9,4,9,99,-1,8'), 9))
            .to.be.equal(0);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,9,7,9,10,9,4,9,99,-1,8'), 1))
            .to.be.equal(1);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,9,7,9,10,9,4,9,99,-1,8'), 8))
            .to.be.equal(0);
    });

    it('should execute example immediate mode programs', function () {
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,3,1108,-1,8,3,4,3,99'), 1))
            .to.be.equal(0);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,3,1108,-1,8,3,4,3,99'), 8))
            .to.be.equal(1);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,3,1108,-1,8,3,4,3,99'), 9))
            .to.be.equal(0);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,3,1107,-1,8,3,4,3,99'), 1))
            .to.be.equal(1);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,3,1107,-1,8,3,4,3,99'), 8))
            .to.be.equal(0);
    });

    it('should execute example jump programs', function () {
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9'), 1))
            .to.be.equal(1);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9'), 0))
            .to.be.equal(0);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,3,1105,-1,9,1101,0,0,12,4,12,99,1'), 1))
            .to.be.equal(1);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram('3,3,1105,-1,9,1101,0,0,12,4,12,99,1'), 0))
            .to.be.equal(0);
    });


    it('should execute example large program', function () {
        const programCode = '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,' +
            '1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,' +
            '999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99';
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram(programCode), 7))
            .to.be.equal(999);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram(programCode), 8))
            .to.be.equal(1000);
        expect(Day5.executeTESTPart2Program(ProgramEngine.compileProgram(programCode), 9))
            .to.be.equal(1001);
    });
})
