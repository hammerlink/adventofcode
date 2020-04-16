import {Day6} from "./day_6";
import {expect} from "chai";

describe('advent of code, day 6', function () {
    it('should map the orbits', function () {
        const input = ['COM)B', 'B)C', 'C)D', 'D)E', 'E)F', 'B)G', 'G)H', 'D)I', 'E)J', 'J)K', 'K)L'];
        const orbitMap = Day6.parseRawInputMap(input);
        expect(orbitMap?.B?.C?.D?.I).to.not.be.null;
        expect(orbitMap?.B?.G?.H).to.not.be.null;
        expect(orbitMap?.B?.C?.D?.E?.J?.K?.L).to.not.be.null;
        expect(orbitMap?.B?.C?.D?.E?.F).to.not.be.null;
    });

    it('should calculate the orbit connections', function () {
        const input = ['COM)B', 'B)C', 'C)D', 'D)E', 'E)F', 'B)G', 'G)H', 'D)I', 'E)J', 'J)K', 'K)L'];
        const orbitMap = Day6.parseRawInputMap(input);
        const totalConnections = Day6.calculateDistances(orbitMap, 0);
        expect(totalConnections).to.be.eq(42);
    });
});
