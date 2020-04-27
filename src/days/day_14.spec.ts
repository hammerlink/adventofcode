import {Day14} from "./day_14";
import {expect} from "chai";

describe('day 14', function () {
    describe('part 1', function () {
        it('should parse the raw input correctly', function () {
            const reaction1: Day14.ChemicalReaction = {
                inputs: [{amount: 10, name: 'ORE'}],
                outputs: [{amount: 10, name: 'A'}],
            };
            expect(JSON.stringify(Day14.parseChemicalReaction('10 ORE => 10 A')))
                .equals(JSON.stringify(reaction1));
            expect(JSON.stringify(Day14.parseChemicalReaction('2 AB, 3 BC, 4 CA => 1 FUEL')))
                .equals(JSON.stringify({
                    inputs: [{amount: 2, name: 'AB'}, {amount: 3, name: 'BC'}, {amount: 4, name: 'CA'}],
                    outputs: [{amount: 1, name: 'FUEL'}],
                }));
        });

        it('should calculate the least amount of ORE required for FUEL', function () {
            const lines = [
                '157 ORE => 5 NZVS',
                '165 ORE => 6 DCFZ',
                '44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL',
                '12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ',
                '179 ORE => 7 PSHF',
                '177 ORE => 5 HKGWZ',
                '7 DCFZ, 7 PSHF => 2 XJWVT',
                '165 ORE => 2 GPVTF',
                '3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT',
            ];
            const reactions = lines.map(Day14.parseChemicalReaction);
            expect(Day14.searchOptimalReactionCost('ORDE', 'FUEL', 1, reactions))
                .equals(13312);
        });
    });
});
