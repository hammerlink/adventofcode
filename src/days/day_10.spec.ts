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
            expect(Day10.findIdealObservationPost(elfMap1,).visibleAsteroids).to.equal(33);
            expect(Day10.findIdealObservationPost(elfMap2,).visibleAsteroids).to.equal(35);
            expect(Day10.findIdealObservationPost(elfMap3,).visibleAsteroids).to.equal(41);
            expect(Day10.findIdealObservationPost(elfMap4,).visibleAsteroids).to.equal(210);
        });
    });

    describe('part 2', function () {
        it('should calculate angles in radians correctly', function () {
            // all 45 degrees
            expect(
                Day10.calculateAngleAndDistance({x: 0, y: 0, isAsteroid: true},
                    {x: 2, y: 2, isAsteroid: true}).angle
            ).to.equal(parseFloat((Math.PI / 4).toFixed(6)));
            expect(
                Day10.calculateAngleAndDistance({x: 0, y: 0, isAsteroid: true},
                    {x: 2, y: -2, isAsteroid: true}).angle
            ).to.equal(parseFloat((Math.PI / 4 * 3).toFixed(6)));
            expect(
                Day10.calculateAngleAndDistance({x: 0, y: 0, isAsteroid: true},
                    {x: -2, y: -2, isAsteroid: true}).angle
            ).to.equal(parseFloat((Math.PI / 4 * 5).toFixed(6)));
            expect(
                Day10.calculateAngleAndDistance({x: 0, y: 0, isAsteroid: true},
                    {x: -2, y: 2, isAsteroid: true}).angle
            ).to.equal(parseFloat((Math.PI / 4 * 7).toFixed(6)));

            // all 90 degrees
            expect(
                Day10.calculateAngleAndDistance({x: 0, y: 0, isAsteroid: true},
                    {x: 2, y: 0, isAsteroid: true}).angle
            ).to.equal(parseFloat((Math.PI / 2).toFixed(6)));
            expect(
                Day10.calculateAngleAndDistance({x: 0, y: 0, isAsteroid: true},
                    {x: 0, y: -2, isAsteroid: true}).angle
            ).to.equal(parseFloat((Math.PI).toFixed(6)));
            expect(
                Day10.calculateAngleAndDistance({x: 0, y: 0, isAsteroid: true},
                    {x: -2, y: 0, isAsteroid: true}).angle
            ).to.equal(parseFloat((Math.PI * 3 / 2).toFixed(6)));
            expect(
                Day10.calculateAngleAndDistance({x: 0, y: 0, isAsteroid: true},
                    {x: 0, y: 2, isAsteroid: true}).angle
            ).to.equal(0);
        });

        it('should laser the asteroids in correct order', function () {
            const map4 = [".#..##.###...#######", "##.############..##.", ".#.######.########.#", ".###.#######.####.#.", "#####.##.#.##.###.##", "..#####..#.#########", "####################", "#.####....###.#.#.##", "##.#################", "#####.##.###..####..", "..######..##.#######", "####.##.####...##..#", ".#####..#.######.###", "##...#.##########...", "#.##########.#######", ".####.#.###.###.#.##", "....##.##.###..#####", ".#.#.###########.###", "#.#.#.#####.####.###", "###.##.####.##.#..##"];

            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 1)).to.equal(1112);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 2)).to.equal(1201);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 3)).to.equal(1202);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 10)).to.equal(1208);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 20)).to.equal(1600);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 50)).to.equal(1609);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 100)).to.equal(1016);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 199)).to.equal(906);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 200)).to.equal(802);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 201)).to.equal(1009);
            expect(Day10.executeLaserOnMap(Day10.parseElfMap(map4), 299)).to.equal(1101);
        });
    });
});
