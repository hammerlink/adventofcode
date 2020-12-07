import {FileEngine} from '../engine/file.engine';

export namespace Y2020_Day5 {

    export function getRow(line: string): number {
        const rowInfo = line.substr(0, 7);
        let total = 0;
        for (let i = 0; i < rowInfo.length; i++) {
            total += rowInfo[rowInfo.length - 1 -i] === 'B' ? Math.pow(2, i) : 0;
        }
        //FBFBBF
        //010110
        return total;
    }

    export function getColumn(line: string): number {
        const columInfo = line.substr(7);
        let total = 0;
        for (let i = 0; i < columInfo.length; i++) {
            total += columInfo[columInfo.length - 1 -i] === 'R' ? Math.pow(2, i) : 0;
        }
        return total;
    }

    export function getSeatID(row: number, column: number): number {
        return row * 8 + column;
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day5.input'), false);
        // Y2020_Day5
        const seats: {[id: number]: boolean} = {};
        let maxId = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const id = Y2020_Day5.getSeatID(Y2020_Day5.getRow(line), Y2020_Day5.getColumn(line));
            seats[id] = true;
            if (id > maxId) maxId = id;
        }
        console.log(maxId)
        // part 2
        for (let i = 1; i < maxId; i++) {
            if (!seats[i] && seats[i - 1] && seats[i + 1] ) console.log(i);
        }
    }

    main().catch(err => console.error(err));

}
