import {expect} from "chai";
import {Day17} from "./day_17";

describe('day 17', function () {
    describe('part 2', function () {
        it('should be able to split all the commands in to smaller lists smaller then 20', function () {
            const exampleCommand = 'R,8,R,8,R,4,R,4,R,8,L,6,L,2,R,4,R,4,R,8,R,8,R,8,L,6,L,2';
            const parts = exampleCommand.split(',').map(x => x.charCodeAt(0));
            expect(parts.length).to.equal(28);

            const instructions = Day17.splitPathCommandsIntoInstructions(parts);
            const mainRoutine = 'A,B,C,B,A,C'.split(',').map(x => x.charCodeAt(0));
            const A = 'R,8,R,8'.split(',').map(x => x.charCodeAt(0));
            const B = 'R,4,R,4,R,8'.split(',').map(x => x.charCodeAt(0));
            const C = 'L,6,L,2'.split(',').map(x => x.charCodeAt(0));
            expect(JSON.stringify(instructions.routine)).equals(JSON.stringify(mainRoutine));
            expect(JSON.stringify(instructions.A)).equals(JSON.stringify(A));
            expect(JSON.stringify(instructions.B)).equals(JSON.stringify(B));
            expect(JSON.stringify(instructions.C)).equals(JSON.stringify(C));
        });
    });
});
