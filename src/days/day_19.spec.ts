import { expect } from "chai";

describe('day 19 part 2', function () {
    it('should calculate the correct lines', function() {
        const values = [
            [8, 0],
            [9, 1],
            [16, 1],
            [17, 2],
            [24, 2],
            [25, 3],
            [32, 3],
            [33, 4],
            [34, 4],
            [35, 3],
            [41, 4],
            [69, 7],
            [70, 6],
        ];

        function calculateNumber(line: number): number {
            const added = parseInt('' + (Math.ceil(line / 8) - 1), 10);
            const subtracted = parseInt('' + (Math.floor(line / 35)), 10);
            return added - subtracted;
        }

        values.forEach(v => {
            expect(calculateNumber(v[0])).equals(v[1]);
        });
        let current = 0;
        while (calculateNumber(current) < 200) current++;
        console.log(current); // 1033 1073

        function getLineStart(v) {
            return v - parseInt('' + (Math.ceil(v / 8) - 1), 10);
        }
    });
});