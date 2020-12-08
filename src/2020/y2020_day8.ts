import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day8 {
    export enum CommandTypes {
        acc='acc',
        jmp='jmp',
        nop='nop',
    }

    export interface Command {
        command: CommandTypes;
        value: number;
    }
    export interface CommandLoop extends Command {
        counter?: number;
        accValueStep?: {[value: number]: number};
    }

    export function parseCommand(line: string): Command {
        const parts = line.match(/(\w{3}) (\+|-)(\d+)/);
        return {
            command: parts[1] as CommandTypes,
            value: parseInt(parts[3]) * (parts[2] === '+' ? 1 : -1),
        };
    }


    export function part1(lines: string[], commands?: CommandLoop[]): {acc: number, infiniteLoop: boolean} {
        if (!commands) commands = lines.map(parseCommand);
        let acc = 0;
        let step = 0;
        let counter = 1;
        let infiniteLoop = false;
        while (step < commands.length) {
            const command = commands[step];
            if (command.counter) {
                infiniteLoop = true;
                break;
            }
            command.counter = counter;

            counter++;
            if (command.command === CommandTypes.acc) acc += command.value;
            if (command.command === CommandTypes.jmp) {
                step += command.value;
                continue;
            }
            step++;
        }
        return {acc, infiniteLoop};
    }

    export function part2(lines: string[]): number {
        const commands: CommandLoop[] = lines.map(parseCommand);
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.command === CommandTypes.acc) continue;
            const newList = JSON.parse(JSON.stringify(commands));
            newList[i] = {
                command: command.command === CommandTypes.jmp ? CommandTypes.nop : CommandTypes.jmp,
                value: command.value,
            }
            const loopResult = part1(lines, newList);
            if (!loopResult.infiniteLoop) return loopResult.acc;
        }
        return null;
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day8.example'));
        assert.equal(Y2020_Day8.part1(exampleLines).acc, 5, 'example 1 part 1')
        assert.equal(Y2020_Day8.part2(exampleLines), 8, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day8.input'));
        // part 1
        const part1Result = Y2020_Day8.part1(lines);
        console.log(part1Result.acc);

        // part 2
        const part2Result = Y2020_Day8.part2(lines);
        console.log(part2Result);


        // assert.equal(part1Result, 235, 'part 1 competition');
        // assert.equal(part2Result, 158493, 'part 2 competition');
    }

    main().catch(err => console.error(err));

}
