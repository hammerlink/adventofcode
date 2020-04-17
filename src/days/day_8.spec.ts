import {Day8} from "./day_8";
import {expect} from "chai";

describe('day 8', function () {
    describe('part 1', function () {
        it('should build the image layers', function () {
            const rawImage = '123456789012';
            const layers = Day8.parseImageData(rawImage, 3, 2);
            expect(layers.length).to.equal(2);

            const firstLayer = layers[0];
            expect(firstLayer[0][1].value).equal(1);
            expect(firstLayer[1][1].value).equal(2);
            expect(firstLayer[2][1].value).equal(3);
            expect(firstLayer[0][0].value).equal(4);
            expect(firstLayer[1][0].value).equal(5);
            expect(firstLayer[2][0].value).equal(6);
            const secondLayer = layers[1];
            expect(secondLayer[0][1].value).equal(7);
            expect(secondLayer[1][1].value).equal(8);
            expect(secondLayer[2][1].value).equal(9);
            expect(secondLayer[0][0].value).equal(0);
            expect(secondLayer[1][0].value).equal(1);
            expect(secondLayer[2][0].value).equal(2);
        });

        it('should store the 0 count', function () {
            const rawImage = '123456789012';
            const layers = Day8.parseImageData(rawImage, 3, 2);
            expect(layers[0].zeroCount).to.equal(0);
            expect(layers[1].zeroCount).to.equal(1);
        });

        it('should count the digits in layer', function () {
            const rawImage = '123456789012';
            const layers = Day8.parseImageData(rawImage, 3, 2);
            expect(Day8.countDigitInImageLayer(layers[0], 0)).to.equal(0);
            expect(Day8.countDigitInImageLayer(layers[1], 0)).to.equal(1);
        });
    });

    describe('part 2', function () {
        it('should parse & print the example correctly', function () {
            const rawImage = '0222112222120000';
            const layers = Day8.parseImageData(rawImage, 2, 2);
            const blackWhiteImage = Day8.convertLayersToBlackWhiteImage(layers);
            const imageLines = Day8.printImage(blackWhiteImage);
            expect(imageLines.length).to.equal(2);
            expect(imageLines[0]).to.equal('01');
            expect(imageLines[1]).to.equal('10');
        });
    });
});
