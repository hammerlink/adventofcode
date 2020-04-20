export namespace Day12 {
    export interface Coordinate {
        x: number;
        y: number;
        z: number;
    }

    export interface Moon {
        id: number;
        position: Coordinate;
        velocity: Coordinate;
    }

    export function updateMoonsVelocity(moons: Moon[]) {
        moons.forEach(moon => updateMoonVelocity(moons, moon));
    }

    export function updateMoonVelocity(moons: Moon[], currentMoon: Moon) {
        moons.forEach(moon => {
            if (moon === currentMoon) return;
            if (moon.position.x !== currentMoon.position.x) currentMoon.velocity.x += moon.position.x > currentMoon.position.x ? 1 : -1;
            if (moon.position.y !== currentMoon.position.y) currentMoon.velocity.y += moon.position.y > currentMoon.position.y ? 1 : -1;
            if (moon.position.z !== currentMoon.position.z) currentMoon.velocity.z += moon.position.z > currentMoon.position.z ? 1 : -1;
        })
    }

    export function executeMoonVelocity(moons: Moon[]) {
        moons.forEach(moon => {
            moon.position.x += moon.velocity.x;
            moon.position.y += moon.velocity.y;
            moon.position.z += moon.velocity.z;
        });
    }

    export function simulateMoonMotions(moons: Moon[], steps: number): Moon[] {
        moons = JSON.parse(JSON.stringify(moons));
        for (let i = 0; i < steps; i++) {
            updateMoonsVelocity(moons);
            executeMoonVelocity(moons);
        }
        return moons;
    }

    export function getPotentialEnergy(moon: Moon): number {
        return Math.abs(moon.position.x) + Math.abs(moon.position.y) + Math.abs(moon.position.z);
    }

    export function getKineticEnergy(moon: Moon): number {
        return Math.abs(moon.velocity.x) + Math.abs(moon.velocity.y) + Math.abs(moon.velocity.z);
    }

    export function calculateTotalEnergy(moons: Moon[]): number {
        let output = 0;
        moons.forEach(moon => {
            const potentialEnergy = getPotentialEnergy(moon);
            const kineticEnergy = getKineticEnergy(moon);
            output += potentialEnergy * kineticEnergy;
        });
        return output;
    }
}

if (!module.parent) {
    const moons: Day12.Moon[] = [
        {id: 0, velocity: {x: 0, y: 0, z: 0}, position: {x: 0, y: 4, z: 0}},
        {id: 1, velocity: {x: 0, y: 0, z: 0}, position: {x: -10, y: -6, z: -14}},
        {id: 2, velocity: {x: 0, y: 0, z: 0}, position: {x: 9, y: -16, z: -3}},
        {id: 2, velocity: {x: 0, y: 0, z: 0}, position: {x: 6, y: -1, z: 2}},
    ];
    const resultMoons = Day12.simulateMoonMotions(moons, 1000);
    console.log('part 1', Day12.calculateTotalEnergy(resultMoons));
}
