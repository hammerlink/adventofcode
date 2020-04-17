export namespace Day8 {
    export interface ImageLayer {
        zeroCount: number;
        width: number;
        height: number;

        [x: number]: {
            [y: number]: { value: number }
        }
    }

    export function parseImageData(rawImage: string, width: number, height: number): ImageLayer[] {
        const outputLayers: ImageLayer[] = [];
        const layerLength = width * height;

        for (let i = 0; i < rawImage.length; i += layerLength) {
            const layerLine = rawImage.substring(i, i + layerLength);
            const imageLayer: ImageLayer = {zeroCount: 0, width, height};
            for (let y = height - 1; y >= 0; y--) {
                for (let x = 0; x < width; x++) {
                    let lineIndex = x + (height - 1 - y) * width;
                    const value = parseInt(layerLine[lineIndex], 10);
                    if (!imageLayer[x]) imageLayer[x] = {};
                    imageLayer[x][y] = {value};
                    if (value === 0) imageLayer.zeroCount++;
                }
            }
            outputLayers.push(imageLayer);
        }

        return outputLayers;
    }

    export function countDigitInImageLayer(imageLayer: ImageLayer, digit: number) {
        let count = 0;
        for (let y = imageLayer.height - 1; y >= 0; y--) {
            for (let x = 0; x < imageLayer.width; x++) {
                if (imageLayer[x][y].value === digit) count++;
            }
        }
        return count;
    }

    export function getImageLayersChecksum(imageLayers: ImageLayer[]): number {
        let smallestZeroCountLayer: ImageLayer = null;
        imageLayers.forEach(layer => {
            if (smallestZeroCountLayer === null || layer.zeroCount < smallestZeroCountLayer.zeroCount)
                smallestZeroCountLayer = layer;
        });
        return countDigitInImageLayer(smallestZeroCountLayer, 1) * countDigitInImageLayer(smallestZeroCountLayer, 2);
    }

    export function convertLayersToBlackWhiteImage(imageLayers: ImageLayer[]): ImageLayer {
        const firstLayer = imageLayers[0];
        const image: ImageLayer = {zeroCount: 0, width: firstLayer.width, height: firstLayer.height};

        for (let y = firstLayer.height - 1; y >= 0; y--) {
            for (let x = 0; x < firstLayer.width; x++) {
                for (let i = 0; i < imageLayers.length; i++) {
                    if (imageLayers[i][x][y].value !== 2) {
                        if (!image[x]) image[x] = {};
                        image[x][y] = {value: imageLayers[i][x][y].value};
                        break;
                    }
                }
            }
        }
        return image;
    }

    export function printImage(imageLayer: ImageLayer): string[] {
        const lines: string[] = [];
        for (let y = imageLayer.height - 1; y >= 0; y--) {
            let line = '';
            for (let x = 0; x < imageLayer.width; x++) {
                line += imageLayer[x][y].value;
            }
            lines.push(line);
        }
        return lines;
    }
}

if (!module.parent) {
    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_8.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        for await (const line of rl) {
            if (!line) return;
            const imageLayers = Day8.parseImageData(line, 25, 6);
            console.log(Day8.getImageLayersChecksum(imageLayers));
            const blackWhiteImage = Day8.convertLayersToBlackWhiteImage(imageLayers);
            const imageLines = Day8.printImage(blackWhiteImage);
            imageLines.forEach(line => console.log(
                line.replace(/0/g, '   ').replace(/1/g, ' O ')
            ));
        }
    }

    main().then(console.log).catch(err => console.error(err));
}
