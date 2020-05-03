import {expect} from "chai";
import {Day16} from "./day_16";

describe('day 16', function () {
    const baseRepeatPattern = [0, 1, 0, -1];
    describe('part 1', function () {
        it('should calculate the repeating patterns', function () {
            expect(JSON.stringify(Day16.getRepeatingPatterns(baseRepeatPattern, 8, 0)))
                .equals('[1,0,-1,0,1,0,-1,0]');
            expect(JSON.stringify(Day16.getRepeatingPatterns(baseRepeatPattern, 8, 1)))
                .equals('[0,1,1,0,0,-1,-1,0]');
            expect(JSON.stringify(Day16.getRepeatingPatterns(baseRepeatPattern, 8, 2)))
                .equals('[0,0,1,1,1,0,0,0]');
            expect(JSON.stringify(Day16.getRepeatingPatterns(baseRepeatPattern, 8, 3)))
                .equals('[0,0,0,1,1,1,1,0]');
        });

        it('should execute a phase correctly', function () {
            expect(Day16.executePhase('12345678', baseRepeatPattern)).equals('48226158');
        });

        it('should execute examples', function () {
            expect(Day16.executePhases('80871224585914546619083218645595', baseRepeatPattern, 100))
                .equals('24176176');
        });
    });
});
