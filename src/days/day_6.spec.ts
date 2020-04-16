import {Day6} from "./day_6";
import {expect} from "chai";

describe('advent of code, day 6', function () {
    it('should map the orbits', function () {
        const input = ['COM)B', 'B)C', 'C)D', 'D)E', 'E)F', 'B)G', 'G)H', 'D)I', 'E)J', 'J)K', 'K)L'];
        const orbitMap = Day6.parseRawInputMap(input).orbitMap;
        expect(orbitMap.orbits?.B.orbits?.C.orbits?.D.orbits?.I).to.not.be.null;
        expect(orbitMap.orbits?.B.orbits?.G.orbits?.H.orbits).to.not.be.null;
        expect(orbitMap.orbits?.B.orbits?.C.orbits?.D.orbits?.E.orbits?.J.orbits?.K.orbits?.L).to.not.be.null;
        expect(orbitMap.orbits?.B.orbits?.C.orbits?.D.orbits?.E.orbits?.F).to.not.be.null;
    });

    it('should calculate the orbit connections', function () {
        const input = ['COM)B', 'B)C', 'C)D', 'D)E', 'E)F', 'B)G', 'G)H', 'D)I', 'E)J', 'J)K', 'K)L'];
        const orbitMap = Day6.parseRawInputMap(input).orbitMap;
        const totalConnections = Day6.calculateDistances(orbitMap, 0);
        expect(totalConnections).to.be.eq(42);
    });

    it('should get the closest transfer', function () {
        const input = ['COM)B', 'B)C', 'C)D', 'D)E', 'E)F', 'B)G', 'G)H', 'D)I', 'E)J', 'J)K', 'K)L', 'K)YOU', 'I)SAN'];
        const parsedMap = Day6.parseRawInputMap(input);
        const startPoint = parsedMap.voidPoint.orbits.YOU;
        expect(startPoint).to.not.be.null;
        const closestTarget = Day6.transferOrbit(startPoint, 'SAN');
        expect(closestTarget).to.be.equal(4);
    });
});
