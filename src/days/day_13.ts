import {ProgramManager} from "../manager/program.manager";
import {ProgramEngine} from "../engine/program.engine";

export namespace Day13 {
    export interface ArcadeTiles {
        [x: number]: {
            [y: number]: {
                value: number;
            };
        }
    }

    export class ArcadeGame extends ProgramManager {
        maxX = null;
        minX = null;
        maxY = null;
        minY = null;

        screen: ArcadeTiles = {};

        currentX = null;
        currentY = null;
        outputCounter = 0;

        joyStick = 0;

        constructor(intCodes: number[], gameMode: boolean = false) {
            super(intCodes);
            if (gameMode) intCodes[0] = 2;
        }

        getInput = async () => {
            // add sleep time, for playableness
            return this.joyStick;
        }

        writeOutput = (output: number) => {
            if (this.outputCounter === 0) this.currentX = output;
            else if (this.outputCounter === 1) this.currentY = output;
            else {
                if (!this.screen[this.currentX]) this.screen[this.currentX] = {};
                this.screen[this.currentX][this.currentY] = {value: output};
                if (this.maxX === null || this.currentX > this.maxX) this.maxX = this.currentX;
                if (this.minX === null || this.currentX < this.minX) this.minX = this.currentX;
                if (this.maxY === null || this.maxY < this.currentY) this.maxY = this.currentY;
                if (this.minY === null || this.minY > this.currentY) this.minY = this.currentY;
                this.outputCounter = -1;
            }
            this.outputCounter++;
            this.printArcadeGame();
        }

        printArcadeGame() {
            for (let y = this.minY; y < this.maxY; y++) {
                let line = '';
                for (let x = this.minX; x < this.maxX; x++) {
                    line += '';
                }
            }
            console.log('--------------------', this.joyStick, '--------------------');
        }
    }

    export async function runArcadeGame(intCodes: number[]) {
        const program = new ProgramManager(intCodes);
        const arcadeTiles: ArcadeTiles = {};
        let outputCounter = 0;
        let currentX = null;
        let currentY = null;
        let blockTiles = 0;
        program.getInput = async () => 0;
        program.writeOutput = (output) => {
            if (outputCounter === 0) currentX = output;
            else if (outputCounter === 1) currentY = output;
            else {
                if (!arcadeTiles[currentX]) arcadeTiles[currentX] = {};
                arcadeTiles[currentX][currentY] = {value: output};
                outputCounter = -1;
                if (output === 2) blockTiles++;
            }

            outputCounter++;
        };
        await program.executeProgram();
        console.log('part 1', blockTiles);
    }
}

if (!module.parent) {

    // @ts-ignore
    import {FileEngine} from "../engine/file.engine";

    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), '../data/day_13.input'));
        const intCodes = ProgramEngine.compileProgram(lines[0]);

        console.log(JSON.stringify(intCodes));

        await Day13.runArcadeGame(intCodes);

        const playIntCodes = ProgramEngine.compileProgram(lines[0]);
        playIntCodes[0] = 2;
    }

    main().catch(err => console.error(err));
}
