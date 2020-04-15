export namespace Day1 {
    export function calculateRequiredFuel(mass: number): number {
        return Math.floor(mass / 3) - 2;
    }
}

if (!module.parent) {
    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_1.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        let total = 0;
        for await (const line of rl) {
            if (!line) return;
            total += Day1.calculateRequiredFuel(parseInt(line, 10));
        }
        return total;
    }

    main().then(console.log).catch(err => console.error(err));
}
