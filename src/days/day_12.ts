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

    export function leastCommonMultiplier(input: number[]): number {
        if (input.length < 2) throw new Error('lcm not enough numbers');
        let currentLCM = lcm_two_numbers(input[0], input[1]);
        for (let i = 2; i < input.length; i++) currentLCM = lcm_two_numbers(currentLCM, input[i]);
        return currentLCM;
    }

    function lcm_two_numbers(x: number, y: number) {
        return (!x || !y) ? 0 : Math.abs((x * y) / gcd_two_numbers(x, y));
    }

    function gcd_two_numbers(x, y) {
        x = Math.abs(x);
        y = Math.abs(y);
        while (y) {
            let t = y;
            y = x % y;
            x = t;
        }
        return x;
    }

    // didnt use
    export function calculateRecurTimeWithLeapsAndReverse(axesPositions: number[]): { start: number, steps: number; } {
        const SKIP_STEP = 1000;
        let steps = 0;
        const velocity = axesPositions.map(_ => 0);
        const positions = axesPositions.map(x => x);
        const history: Array<{ e: number; p: number }> = [];
        let currentEnergy = getTotalEnergy(positions, velocity);
        let currentIntPosition = getIntPrintPositions(positions);
        history.push({e: currentEnergy, p: currentIntPosition});
        while (true) {
            executeTimeStepWithAxes(positions, velocity);
            steps++;
            currentEnergy = getTotalEnergy(positions, velocity);
            currentIntPosition = getIntPrintPositions(positions);
            history.push({e: currentEnergy, p: currentIntPosition});
            // matching algorithm
            if (steps % SKIP_STEP === 0) {
                let matchingIndex: number = null;
                // search for matches first
                for (let i = steps - 1; i >= 0; i--) {
                    const record = history[i];
                    if (record.e !== currentEnergy || record.p !== currentIntPosition) continue;
                    // match found, check reverse history & calculate first recurrence
                    const delta = steps - i;
                    for (let j = i; j >= 0; j--) {
                        const firstRecord = history[j];
                        const secondRecord = history[j + delta];
                        if (firstRecord.e !== secondRecord.e || firstRecord.p !== secondRecord.p) {
                            return {steps: delta, start: j + 1};
                        }
                    }
                    return {steps: delta, start: 0};
                }
            }
        }
    }

    export function executeTimeStepWithAxes(positions: number[], velocity: number[]) {
        for (let i = 0; i < 4; i++) {
            let currentPosition = positions[i];
            for (let j = 0; j < 4; j++) {
                if (i === j) continue;
                if (positions[j] !== currentPosition) velocity[i] += positions[j] > currentPosition ? 1 : -1;
            }
        }
        for (let i = 0; i < 4; i++) positions[i] += velocity[i];
    }

    export function getTotalEnergy(positions: number[], velocity: number[]): number {
        return positions.reduce((total, currentValue, currentIndex, array) => {
            return total + Math.abs(currentValue) * Math.abs(velocity[currentIndex]);
        }, 0);
    }

    export function getIntPrintPositions(positions: number[]): number {
        return positions[0] * 1000000 + positions[1] * 10000 + positions[2] * 100 + positions[3];
    }

    export function calculateStepsForStartRecurForAxis(axesPositions: number[]): number {
        if (axesPositions.length !== 4) throw new Error('invalid axes input');
        let steps = 0;
        const velocity = axesPositions.map(_ => 0);
        const positions = axesPositions.map(x => x);
        let currentTotalEnergy = getTotalEnergy(positions, velocity);
        const energyZeroHistory: Array<{ index: number, positions: string }> = [];

        function execute1TimeStep() {
            for (let i = 0; i < 4; i++) {
                let currentPosition = positions[i];
                for (let j = 0; j < 4; j++) {
                    if (i === j) continue;
                    if (positions[j] !== currentPosition) velocity[i] += positions[j] > currentPosition ? 1 : -1;
                }
            }
            for (let i = 0; i < 4; i++) positions[i] += velocity[i];
            if (currentTotalEnergy === 0) {
                energyZeroHistory.push({index: steps, positions: JSON.stringify({p: positions, v: velocity})});
            }
            steps++;
            currentTotalEnergy = getTotalEnergy(positions, velocity);
        }

        let recurring = false;
        let currentLength = energyZeroHistory.length;
        while (!recurring) {
            execute1TimeStep();
            if (currentLength < energyZeroHistory.length) {
                currentLength = energyZeroHistory.length;
                const current = energyZeroHistory[energyZeroHistory.length - 1].positions;
                for (let i = 0; i < energyZeroHistory.length - 1; i++) {
                    if (energyZeroHistory[i].positions === current) {
                        console.log('found index', i);
                        return steps - energyZeroHistory[i].index - 1;
                    }
                }
            }

            if (steps % 100000000 === 0) {
                console.log(steps);
            }
        }
    }

    export function calculateStepsToRecurForAxis(axesPositions: number[]): number {
        if (axesPositions.length !== 4) throw new Error('invalid axes input');
        let steps = 0;
        const velocity = axesPositions.map(_ => 0);
        const positions = axesPositions.map(x => x);
        let currentTotalEnergy = getTotalEnergy(positions, velocity);
        const energyHistory = [];
        const positionHistory = [];
        let recurring = false;
        while (!recurring) {
            // calculate velocity
            for (let i = 0; i < 4; i++) {
                let currentPosition = positions[i];
                for (let j = 0; j < 4; j++) {
                    if (i === j) continue;
                    if (positions[j] !== currentPosition) velocity[i] += positions[j] > currentPosition ? 1 : -1;
                }
            }
            // apply velocity
            for (let i = 0; i < 4; i++) positions[i] += velocity[i];
            energyHistory.push(currentTotalEnergy); // previous history
            positionHistory.push(getIntPrintPositions(positions));
            let energyHistoryIndex = energyHistory.indexOf(currentTotalEnergy);
            while (energyHistoryIndex !== steps && energyHistoryIndex !== -1 &&
            positionHistory[steps] === positionHistory[energyHistoryIndex]) {
                if (
                    energyHistory[steps - 1] === energyHistory[energyHistoryIndex - 1] &&
                    positionHistory[steps - 1] === positionHistory[energyHistoryIndex - 1] &&
                    energyHistory[steps - 2] === energyHistory[energyHistoryIndex - 2] &&
                    positionHistory[steps - 2] === positionHistory[energyHistoryIndex - 2]
                ) { // check 3 steps back
                    recurring = true;
                    break;
                }
                if (recurring) break;
                energyHistoryIndex = energyHistory.indexOf(currentTotalEnergy, energyHistoryIndex + 1);
            }
            if (recurring) break;
            steps++;
            if (steps % 1000000 === 0) {
                console.log(steps);
            }
            currentTotalEnergy = getTotalEnergy(positions, velocity);
        }
        return steps - 2;
    }

    export function calculateStepsToRecur(moons: Moon[]): number {
        const startMoons: Moon[] = JSON.parse(JSON.stringify(moons));
        const recurringStepsX = calculateStepsForStartRecurForAxis(startMoons.map(x => x.position.x)); // 1666200
        console.log(recurringStepsX);
        const recurringStepsZ = calculateStepsForStartRecurForAxis(startMoons.map(x => x.position.z)); // 8533740
        console.log(recurringStepsZ);
        const recurringStepsY = calculateStepsForStartRecurForAxis(startMoons.map(x => x.position.y));
        console.log(recurringStepsY);
        return leastCommonMultiplier([recurringStepsX, recurringStepsY, recurringStepsZ]);
    }
}

if (!module.parent) {
    const moons: Day12.Moon[] = [
        {id: 0, velocity: {x: 0, y: 0, z: 0}, position: {x: 0, y: 4, z: 0}},
        {id: 1, velocity: {x: 0, y: 0, z: 0}, position: {x: -10, y: -6, z: -14}},
        {id: 2, velocity: {x: 0, y: 0, z: 0}, position: {x: 9, y: -16, z: -3}},
        {id: 2, velocity: {x: 0, y: 0, z: 0}, position: {x: 6, y: -1, z: 2}},
    ];
    console.log('part 1', Day12.calculateTotalEnergy(Day12.simulateMoonMotions(moons, 1000)));
    console.log('part 2', Day12.calculateStepsToRecur(moons));
}
