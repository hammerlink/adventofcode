import {expect} from "chai";
import {MapEngine} from './map.engine';

describe('MapEngine', function () {
    describe('flipMapXAxis', function () {
        it('should flip axis in positive quadrant', function () {
            const example1 = MapEngine.newMap<number>();
            let counter = 0;
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < 5; x++) {
                    MapEngine.setPointInMap(example1, x, y, counter);
                    counter++;
                }
            }
            MapEngine.printMap(example1, x => `${x.value}`);
            const flippedX = MapEngine.flipMapXAxis(example1);
            console.log();
            MapEngine.printMap(flippedX, x => `${x.value}`);
            // LEFT TOP
            expect(example1[0][0].value).to.equals(0);
            expect(flippedX[0][0].value).to.equals(4);
            // RIGHT TOP
            expect(example1[4][0].value).to.equals(4);
            expect(flippedX[4][0].value).to.equals(0);
            // LEFT BOTTOM
            expect(example1[0][4].value).to.equals(20);
            expect(flippedX[0][4].value).to.equals(24);
            // RIGHT BOTTOM
            expect(example1[4][4].value).to.equals(24);
            expect(flippedX[4][4].value).to.equals(20);
        });
        it('should flip axis in negative quadrant', function () {
            const example1 = MapEngine.newMap<number>();
            let counter = 0;
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < 5; x++) {
                    MapEngine.setPointInMap(example1, -x, -y, counter);
                    counter++;
                }
            }
            MapEngine.printMap(example1, x => `${x.value}`);
            const flippedX = MapEngine.flipMapXAxis(example1);
            console.log();
            MapEngine.printMap(flippedX, x => `${x.value}`);
            // LEFT TOP
            expect(example1[0][0].value).to.equals(0);
            expect(flippedX[0][0].value).to.equals(4);
            // RIGHT TOP
            expect(example1[-4][0].value).to.equals(4);
            expect(flippedX[-4][0].value).to.equals(0);
            // LEFT BOTTOM
            expect(example1[0][-4].value).to.equals(20);
            expect(flippedX[0][-4].value).to.equals(24);
            // RIGHT BOTTOM
            expect(example1[-4][-4].value).to.equals(24);
            expect(flippedX[-4][-4].value).to.equals(20);
        });
    });
    describe('flipMapYAxis', function () {
        it('should flip axis in positive quadrant', function () {
            const example1 = MapEngine.newMap<number>();
            let counter = 0;
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < 5; x++) {
                    MapEngine.setPointInMap(example1, x, y, counter);
                    counter++;
                }
            }
            MapEngine.printMap(example1, x => `${x.value}`);
            const flippedX = MapEngine.flipMapYAxis(example1);
            console.log();
            MapEngine.printMap(flippedX, x => `${x.value}`);
            // LEFT TOP
            expect(example1[0][0].value).to.equals(0);
            expect(flippedX[0][0].value).to.equals(20);
            // RIGHT TOP
            expect(example1[4][0].value).to.equals(4);
            expect(flippedX[4][0].value).to.equals(24);
            // LEFT BOTTOM
            expect(example1[0][4].value).to.equals(20);
            expect(flippedX[0][4].value).to.equals(0);
            // RIGHT BOTTOM
            expect(example1[4][4].value).to.equals(24);
            expect(flippedX[4][4].value).to.equals(4);
        });
    });
    describe('rotateLeft', function () {
        it('should rotate left in positive quadrant', function () {
            const example1 = MapEngine.newMap<number>();
            let counter = 0;
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < 5; x++) {
                    MapEngine.setPointInMap(example1, x, y, counter);
                    counter++;
                }
            }
            MapEngine.printMap(example1, x => `${x.value}`);
            const flippedX = MapEngine.rotateLeft(example1);
            console.log();
            MapEngine.printMap(flippedX, x => `${x.value}`);
            // LEFT TOP
            expect(example1[0][0].value).to.equals(0);
            expect(flippedX[0][0].value).to.equals(4);
            // RIGHT TOP
            expect(example1[4][0].value).to.equals(4);
            expect(flippedX[4][0].value).to.equals(24);
            // LEFT BOTTOM
            expect(example1[0][4].value).to.equals(20);
            expect(flippedX[0][4].value).to.equals(0);
            // RIGHT BOTTOM
            expect(example1[4][4].value).to.equals(24);
            expect(flippedX[4][4].value).to.equals(20);
        });
        it('should rotate left in negative quadrant', function () {
            const example1 = MapEngine.newMap<number>();
            let counter = 0;
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < 5; x++) {
                    MapEngine.setPointInMap(example1, -(x - 0), -y, counter);
                    counter++;
                }
            }
            MapEngine.printMap(example1, x => `${x.value}`);
            const flippedX = MapEngine.rotateLeft(example1);
            console.log();
            MapEngine.printMap(flippedX, x => `${x.value}`);
            // LEFT TOP
            expect(example1[-4][-4].value).to.equals(24);
            expect(flippedX[-4][-4].value).to.equals(20);
            // RIGHT TOP
            expect(example1[0][-4].value).to.equals(20);
            expect(flippedX[0][-4].value).to.equals(0);
            // LEFT BOTTOM
            expect(example1[-4][0].value).to.equals(4);
            expect(flippedX[-4][0].value).to.equals(24);
            // RIGHT BOTTOM
            expect(example1[0][0].value).to.equals(0);
            expect(flippedX[0][0].value).to.equals(4);
        });
    });
});
