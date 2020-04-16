export namespace Day6 {
    export interface OrbitPoint {
        orbitID: string;
        comDistance?: number;
        parentOrbit: OrbitPoint;
        orbits: { [orbitCode: string]: OrbitPoint; };
    }

    export function parseRawInputMap(lines: string[]): { orbitMap: OrbitPoint, voidPoint: OrbitPoint } {
        const voidPoint: OrbitPoint = {orbitID: null, orbits: {}, parentOrbit: null,};
        // register all points
        lines.forEach(line => {
            const orbits = line.split(')');
            if (!voidPoint.orbits[orbits[0]]) voidPoint.orbits[orbits[0]] = {
                orbitID: orbits[0],
                parentOrbit: null,
                orbits: {}
            };
            if (!voidPoint.orbits[orbits[1]]) voidPoint.orbits[orbits[1]] = {
                orbitID: orbits[1],
                parentOrbit: null,
                orbits: {}
            };
            const parentOrbit = voidPoint.orbits[orbits[0]];
            const childOrbit = voidPoint.orbits[orbits[1]];

            parentOrbit.orbits[childOrbit.orbitID] = childOrbit;
            childOrbit.parentOrbit = parentOrbit;
        });
        return {orbitMap: voidPoint.orbits.COM, voidPoint};
    }

    export function calculateDistances(orbit: OrbitPoint, currentDistance: number): number {
        let totalDistance = currentDistance;
        for (const key in orbit.orbits) {
            const connectedOrbit: OrbitPoint = orbit.orbits[key];
            connectedOrbit.comDistance = currentDistance + 1;
            totalDistance += calculateDistances(connectedOrbit, currentDistance + 1);
        }
        return totalDistance;
    }

    export function transferOrbit(currentOrbit: OrbitPoint, targetOrbitKey: string): number {
        let closestTransfer: number = null;
        let closestParentOrbit: OrbitPoint = null;

        // start from parent orbit

        function searchClosestOrbitPath(currentOrbit: OrbitPoint, currentSteps: number, orbitsPassed: string[]) {
            if ((closestTransfer !== null && currentSteps > closestTransfer)
                || orbitsPassed.find(x => x === currentOrbit.orbitID)) return;
            if (!!currentOrbit.orbits[targetOrbitKey]) {
                if (closestTransfer === null || currentSteps < closestTransfer) {
                    closestTransfer = currentSteps;
                    closestParentOrbit = currentOrbit;
                }
                return;
            }
            const newOrbitsPassed = [...orbitsPassed, currentOrbit.orbitID];
            if (currentOrbit.parentOrbit)
                searchClosestOrbitPath(currentOrbit.parentOrbit, currentSteps + 1, newOrbitsPassed);
            for (const key in currentOrbit.orbits) {
                searchClosestOrbitPath(currentOrbit.orbits[key], currentSteps + 1, newOrbitsPassed);
            }
        }

        searchClosestOrbitPath(currentOrbit.parentOrbit, 0, [currentOrbit.orbitID]);

        if (closestTransfer) {
            const currentParent = currentOrbit.parentOrbit;
            delete currentParent.orbits[currentOrbit.orbitID];
            currentOrbit.parentOrbit = closestParentOrbit;
            closestParentOrbit.orbits[currentOrbit.orbitID] = currentOrbit;
        }
        return closestTransfer;
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

        const parsedOrbits = Day6.parseRawInputMap(lines);
        const orbitMap = parsedOrbits.orbitMap;
        const totalConnections = Day6.calculateDistances(orbitMap, 0);
        console.log('part 1', totalConnections);

        const startPoint = parsedOrbits.voidPoint.orbits.YOU;
        const closestTarget = Day6.transferOrbit(startPoint, 'SAN');
        console.log('part 2', closestTarget);
    }

    main().then(console.log).catch(err => console.error(err));
}
