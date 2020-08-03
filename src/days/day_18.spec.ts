import {expect} from "chai";
import {Day18} from "./day_18";

describe('day 18', function () {
    describe('part 1', function () {
        it('should solve example 1', function () {
            const lines = [
                '#########',
                '#b.A.@.a#',
                '#########',
            ];
            const result = Day18.solveMap(lines);
            expect(result).to.equals(8);
        });

        it('should solve example 2', function () {
            const lines = [
                '########################',
                '#...............b.C.D.f#',
                '#.######################',
                '#.....@.a.B.c.d.A.e.F.g#',
                '########################',
            ];
            const result = Day18.solveMap(lines);
            expect(result).to.equals(132);
        });

        it('should find best path example 3', function () {
            this.timeout(10000);
            const lines = [
                '#################',
                '#i.G..c...e..H.p#',
                '########.########',
                '#j.A..b...f..D.o#',
                '########@########',
                '#k.E..a...g..B.n#',
                '########.########',
                '#l.F..d...h..C.m#',
                '#################',
            ];
            const result = Day18.solveMap(lines);
            expect(result).to.equals(136);
        });

        it('should find best path example 4', function () {
            this.timeout(10000);
            const lines = [
                '########################',
                '#@..............ac.GI.b#',
                '###d#e#f################',
                '###A#B#C################',
                '###g#h#i################',
                '########################',
            ];

            const result = Day18.solveMap(lines);
            expect(result).to.equals(81);
        });

        it('should map alternative routes', function() {
            const lines = [
                '#################',
                '#@#...b..#......#',
                '#d#.####.#......#',
                '#aD.B...c#......#',
                '####.###.#......#',
                '####.....#......#',
                '#################',
            ];
            // 2 routes should exist a -> c
            const result = Day18.solveMap(lines);
        });

        it('should take shortest path', function() {
            const lines = [
                '#################',
                '#######.....#####',
                '#######.###.#####',
                '#######a.@..#####',
                '#################',
            ];
            // 2 routes should exist a -> c
            const result = Day18.solveMap(lines);
            expect(result).equals(2);
        });

        it('should getUniqueSortedKeyString', function () {
            expect(Day18.getUniqueSortedKeyString('baced')).equals('abcde');
        });

        it('should compareKeyIds', function () {
            let result = Day18.compareKeyIds('abc', 'cde');
            expect(result.extraKeys).equals('ab');
            expect(result.missingKeys).equals('de');
            result = Day18.compareKeyIds('abc', 'abcd');
            expect(result.extraKeys).equals('');
            expect(result.missingKeys).equals('d');
        });

    });
});
