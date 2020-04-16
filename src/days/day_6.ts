export namespace Day6 {
    export interface OrbitPoint {
        comDistance?: any;

        [orbitCode: string]: OrbitPoint;
    }

    export function parseRawInputMap(lines: string[]): OrbitPoint {
        const voidPoint: OrbitPoint = {};
        // register all points
        lines.forEach(line => {
            const orbits = line.split(')');
            if (!voidPoint[orbits[0]]) voidPoint[orbits[0]] = {};
            if (!voidPoint[orbits[1]]) voidPoint[orbits[1]] = {};
            // lay orbit
            voidPoint[orbits[0]][orbits[1]] = voidPoint[orbits[1]];
        });
        return voidPoint.COM;
    }

    export function calculateDistances(orbit: OrbitPoint, currentDistance: number): number {
        let totalDistance = currentDistance;
        for (const key in orbit) {
            if (key === 'comDistance') continue;
            const connectedOrbit: OrbitPoint = orbit[key];
            connectedOrbit.comDistance = currentDistance + 1;
            totalDistance += calculateDistances(connectedOrbit, currentDistance + 1);
        }
        return totalDistance;
    }
}

if (!module.parent) {
    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_6.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        const lines = [];
        for await (const line of rl) {
            if (!line) return;
            lines.push(line);
        }

        const orbitMap = Day6.parseRawInputMap(lines);
        const totalConnections = Day6.calculateDistances(orbitMap, 0);
        console.log(totalConnections);

    }

    main().then(console.log).catch(err => console.error(err));
}
