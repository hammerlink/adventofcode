import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2022_Day16 {
    export interface ValveTargets {
        [valveId: string]: { steps: number }
    }

    export interface Valve {
        id: string;
        flowRate: number;
        targetTunnelIds: string[];
        targets: ValveTargets;
    }

    export function parseInput(lines: string[]): Valve[] {
        const regex = /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.*)$/;
        return lines.map(line => {
            const match = line.match(regex);
            const targetTunnelIds = match[3].split(', ');
            const targets: ValveTargets = {};
            targetTunnelIds.forEach(id => targets[id] = {steps: 1});
            return {id: match[1], flowRate: parseInt(match[2]), targetTunnelIds, targets,};
        });
    }

    function fillTargets(valves: Valve[]): Valve[] {
        // const relevantValves = valves.filter(x => x.id === 'AA' || x.flowRate > 0);
        const valveMap: { [id: string]: Valve } = {};
        valves.forEach(valve => valveMap[valve.id] = valve);
        while (true) {
            let counter = 0;
            valves.forEach(valve => {
                // pass other targets
                Object.keys(valve.targets).forEach(targetId => {
                    if (targetId === valve.id) return;
                    const targetValve = valveMap[targetId];
                    const stepsToTarget = valve.targets[targetId].steps;
                    Object.keys(targetValve.targets).forEach(otherTargetId => {
                        if (otherTargetId === valve.id) return;
                        const requiredSteps = targetValve.targets[otherTargetId].steps + stepsToTarget;
                        if (!valve.targets[otherTargetId] || valve.targets[otherTargetId].steps > requiredSteps) {
                            counter++;
                            valve.targets[otherTargetId] = {steps: requiredSteps};
                            valve.targets[otherTargetId].steps = requiredSteps;
                        }
                    })
                });
            });
            if (counter === 0) break;
        }
        // if they cannot access AA, it is not accessible
        const filteredValves = valves.filter(x => x.id === 'AA' || (!!x.targets.AA && x.flowRate > 0));
        const valveIds = filteredValves.map(x => x.id);
        // remove targets that have been filtered
        filteredValves.forEach(valve => {
            Object.keys(valve.targets).forEach(targetId => {
                if (!valveIds.includes(targetId)) delete valve.targets[targetId];
            })
        });
        filteredValves.sort((a, b) => b.flowRate - a.flowRate);
        return filteredValves;
    }

    let part1BestScore: number | null = null;
    export let part2BestScore: number | null = null;
    type ValveIteration = {
        currentValve: Valve;
        openValveIds: string[];
        stepCounter: number;
        pressureRelease: number;
        maxSteps: number;
    };

    function iterateOptions(valves: Valve[], iteration: ValveIteration): number | null {
        const currentValve = iteration.currentValve;
        const openValveIds = iteration.openValveIds;
        const stepCounter = iteration.stepCounter;
        for (let i = 0; i < valves.length; i++) {
            const valve = valves[i];
            if (valve.id === currentValve.id || openValveIds.includes(valve.id) || valve.flowRate === 0) continue;
            const requiredSteps = valve.targets[currentValve.id].steps;
            if (stepCounter + requiredSteps + 1 > iteration.maxSteps) continue;
            let updatedStepCounter = stepCounter + requiredSteps + 1;
            const extraPressureRelease = (iteration.maxSteps - updatedStepCounter) * valve.flowRate;
            const updatedPressureRelease = iteration.pressureRelease + extraPressureRelease;
            if (part1BestScore === null || updatedPressureRelease > part1BestScore) part1BestScore = updatedPressureRelease;
            iterateOptions(valves, {
                ...iteration,
                stepCounter: updatedStepCounter,
                currentValve: valve,
                openValveIds: [...iteration.openValveIds, valve.id],
                pressureRelease: updatedPressureRelease,
            })
        }
        return iteration.pressureRelease;
    }

    type ValveIteration2 = {
        currentValve1: Valve;
        currentValve2: Valve;
        openValveIds: string[];
        stepCounter1: number;
        stepCounter2: number;
        pressureRelease: number;
        maxSteps: number;
    };

    function iterateOptions2(valves: Valve[], iteration: ValveIteration2): number | null {
        const {currentValve1, currentValve2, openValveIds, stepCounter1, stepCounter2} = iteration;
        const currentValveIds = [currentValve1.id, currentValve2.id, ...iteration.openValveIds];
        // SELECT VALVE 1
        for (let i = 0; i < valves.length; i++) {
            const valve1 = valves[i];

            if (!!currentValveIds.includes(valve1.id) || valve1.flowRate === 0) continue;
            const requiredSteps = valve1.targets[currentValve1.id].steps;
            if (stepCounter1 + requiredSteps + 1 > iteration.maxSteps) continue;
            let updated1StepCounter = stepCounter1 + requiredSteps + 1;
            const extra1PressureRelease = (iteration.maxSteps - updated1StepCounter) * valve1.flowRate;
            const updated1PressureRelease = iteration.pressureRelease + extra1PressureRelease;
            if (part2BestScore === null || updated1PressureRelease > part2BestScore) part2BestScore = updated1PressureRelease;


            // SELECT VALVE 2
            for (let j = 0; j <valves.length; j++) {
                const valve2 = valves[j];

                if (j === i || !!currentValveIds.includes(valve2.id) || valve2.flowRate === 0) continue;
                // todo check if nothing can be selected
                const requiredSteps = valve2.targets[currentValve2.id].steps;
                if (stepCounter2 + requiredSteps + 1 > iteration.maxSteps) continue;
                let updated2StepCounter = stepCounter2 + requiredSteps + 1;
                const extra2PressureRelease = (iteration.maxSteps - updated2StepCounter) * valve2.flowRate;
                const updated2PressureRelease = updated1PressureRelease + extra2PressureRelease;
                if (part2BestScore === null || updated2PressureRelease > part2BestScore) part2BestScore = updated2PressureRelease;
                iterateOptions2(valves, {
                    ...iteration,
                    stepCounter1: updated1StepCounter,
                    stepCounter2: updated2StepCounter,
                    openValveIds: [...iteration.openValveIds, valve1.id, valve2.id],
                    pressureRelease: updated2PressureRelease,
                    currentValve1: valve1,
                    currentValve2: valve2,
                })
            }

        }
        return iteration.pressureRelease;
    }

    export function part1(lines: string[]): number {
        const valves = fillTargets(parseInput(lines));
        part1BestScore = null;
        iterateOptions(valves, {
            currentValve: valves.find(x => x.id === 'AA'),
            openValveIds: [],
            stepCounter: 0,
            pressureRelease: 0,
            maxSteps: 30,
        });
        return part1BestScore;
    }

    export function part2(lines: string[]): number {
        const valves = fillTargets(parseInput(lines));
        part2BestScore = null;
        const startValve = valves.find(x => x.id === 'AA');
        iterateOptions2(valves, {
            currentValve1: startValve,
            currentValve2: startValve,
            openValveIds: [],
            stepCounter1: 0,
            stepCounter2: 0,
            pressureRelease: 0,
            maxSteps: 26,
        });
        return part2BestScore;
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {

        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2022_day16.example'), false);

        assert.equal(Y2022_Day16.part1(exampleLines), 1651, 'example 1 part 1');

        assert.equal(Y2022_Day16.part2(exampleLines), 1707, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2022_day16.input'), false);
        // part 1
        let startMs = Date.now();
        const part1Result = Y2022_Day16.part1(lines);
        console.log('part 1', part1Result, 'ms', Date.now() - startMs);

        // part 2
        startMs = Date.now();
        const part2Result = Y2022_Day16.part2(lines);
        console.log('part 2', part2Result, 'ms', Date.now() - startMs);
    }

    main().catch(err => console.error(err));
}
