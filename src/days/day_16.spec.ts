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

    describe('part 2', function () {
        it('should get repeat value', function () {
            const result = [
                [1, 0, -1, 0, 1, 0, -1, 0],
                [0, 1, 1, 0, 0, -1, -1, 0],
                [0, 0, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 0],
            ];
            for (let multiplier = 0; multiplier < result.length; multiplier++) {
                for (let i = 0; i < result[multiplier].length; i++) {
                    expect(Day16.getRepeatValue(baseRepeatPattern, multiplier, i)).equals(result[multiplier][i]);
                }
            }
        });


        it('should execute a phase correctly', function () {
            const resultPhase = Day16.executeOptimalPhases('12345678'.split('').map(x => parseInt(x, 10)),
                1);
            expect(JSON.stringify(resultPhase))
                .equals(JSON.stringify('48226158'.split('').map(x => parseInt(x, 10))));
        });

        it('should execute examples', function () {
            const input = '80871224585914546619083218645595'.split('').map(x => parseInt(x, 10));
            const resultPhase = Day16.executeOptimalPhases(input, 100);
            expect(JSON.stringify(resultPhase.slice(0, 8)))
                .equals(JSON.stringify('24176176'.split('').map(x => parseInt(x, 10))));
        });

        it('should extract the real message', function () {
            const rawInput = '03036732577212944063491565474664';
            const rawNInput = rawInput.split('').map(x => parseInt(x, 10));
            let input = '';
            for (let i = 0; i < 10000; i++) input += rawInput;
            const offset: number = parseInt(input.slice(0, 7), 10);
            const output = Day16.executeOptimalPhases(input.split('').map(x => parseInt(x, 10)), 5);
            const rawOutput = output.reduce((total, value) => total + value, '');
            let realOffset = offset % input.length;
            // expect(message).equals('84462026');
        });
    });

});
