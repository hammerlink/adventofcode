import {Day10} from "./day_10";
import {expect} from "chai";

describe('day 10', function () {
    describe('part 1', function () {
        it('should parse & print the map', function () {
            const rawMap = ['.#..#', '.....', '#####', '....#', '...##'];

            const elfMap = Day10.parseElfMap(rawMap);
            const printedMap = Day10.printElfMap(elfMap);

            expect(JSON.stringify(rawMap)).to.equal(JSON.stringify(printedMap));
        });

        it('should find all interfering locations between 2 locations', function () {
            const rawMap = ["#.........", "...#......", "...#..#...", ".####....#", "..#.#.#...", ".....#....", "..###.#.##", ".......#..", "....#...#.", "...#..#..#"];
            const elfMap = Day10.parseElfMap(rawMap);

            expect(JSON.stringify(Day10.getInterferingLocations(elfMap[0][9], elfMap[9][6], elfMap).map(x => [x.x, x.y])))
                .to.equal(JSON.stringify([[3, 8], [6, 7]]), 'line A');
            expect(JSON.stringify(Day10.getInterferingLocations(elfMap[0][9], elfMap[9][3], elfMap).map(x => [x.x, x.y])))
                .to.equal(JSON.stringify([[3, 7], [6, 5]]), 'line B');
            expect(JSON.stringify(Day10.getInterferingLocations(elfMap[0][9], elfMap[9][0], elfMap).map(x => [x.x, x.y])))
                .to.equal(JSON.stringify([[3, 6], [4, 5], [5, 4], [6, 3], [7, 2], [8, 1]]), 'line C');
            expect(JSON.stringify(Day10.getInterferingLocations(elfMap[0][9], elfMap[6][0], elfMap).map(x => [x.x, x.y])))
                .to.equal(JSON.stringify([[2, 6], [4, 3]]), 'line D');
            expect(JSON.stringify(Day10.getInterferingLocations(elfMap[0][9], elfMap[3][0], elfMap).map(x => [x.x, x.y])))
                .to.equal(JSON.stringify([[1, 6], [2, 3]]), 'line E');
            expect(JSON.stringify(Day10.getInterferingLocations(elfMap[0][9], elfMap[4][1], elfMap).map(x => [x.x, x.y])))
                .to.equal(JSON.stringify([[2, 5], [3, 3]]), 'line F');
            expect(JSON.stringify(Day10.getInterferingLocations(elfMap[0][9], elfMap[8][3], elfMap).map(x => [x.x, x.y])))
                .to.equal(JSON.stringify([[4, 6]]), 'line G');
        });

        const map1 = ["......#.#.", "#..#.#....", "..#######.", ".#.#.###..", ".#..#.....", "..#....#.#", "#..#....#.", ".##.#..###", "##...#..#.", ".#....####"];
        const elfMap1 = Day10.parseElfMap(map1);
        const map2 = ["#.#...#.#.", ".###....#.", ".#....#...", "##.#.#.#.#", "....#.#.#.", ".##..###.#", "..#...##..", "..##....##", "......#...", ".####.###."];
        const elfMap2 = Day10.parseElfMap(map2);
        const map3 = [".#..#..###", "####.###.#", "....###.#.", "..###.##.#", "##.##.#.#.", "....###..#", "..#.#..#.#", "#..#.#.###", ".##...##.#", ".....#.#.."];
        const elfMap3 = Day10.parseElfMap(map3);
        const map4 = [".#..##.###...#######", "##.############..##.", ".#.######.########.#", ".###.#######.####.#.", "#####.##.#.##.###.##", "..#####..#.#########", "####################", "#.####....###.#.#.##", "##.#################", "#####.##.###..####..", "..######..##.#######", "####.##.####...##..#", ".#####..#.######.###", "##...#.##########...", "#.##########.#######", ".####.#.###.###.#.##", "....##.##.###..#####", ".#.#.###########.###", "#.#.#.#####.####.###", "###.##.####.##.#..##"];
        const elfMap4 = Day10.parseElfMap(map4);

        it('should calculate the visible asteroids correctly', function () {
            expect(Day10.getVisibleAsteroidCount(elfMap1, 5, elfMap1.height - 1 - 8)).to.equal(33);
            expect(Day10.getVisibleAsteroidCount(elfMap2, 1, elfMap2.height - 1 - 2)).to.equal(35);
            expect(Day10.getVisibleAsteroidCount(elfMap3, 6, elfMap3.height - 1 - 3)).to.equal(41);
            expect(Day10.getVisibleAsteroidCount(elfMap4, 11, elfMap4.height - 1 - 13)).to.equal(210);
        });

        it('should find the asteroid with the most visible other asteroids', function () {
            expect(Day10.findIdealObservationPost(elfMap1,)).to.equal(33);
            expect(Day10.findIdealObservationPost(elfMap2,)).to.equal(35);
            expect(Day10.findIdealObservationPost(elfMap3,)).to.equal(41);
            expect(Day10.findIdealObservationPost(elfMap4,)).to.equal(210);
        });
    });
});
