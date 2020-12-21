import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day16 {
    export interface TicketRule {
        name: string;
        intervals: Array<{low: number, high: number}>;
    }

    export interface Ticket {
        values: number[];
    }

    export function parseInput(lines: string[]): {tickets: Ticket[], myTicket: Ticket, rules: TicketRule[]} {
        let i = 0;
        const rules: TicketRule[] = [];
        const ruleRegex = /(.+): (\d+)-(\d+) or (\d+)-(\d+)/;
        for (i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/your ticket/)) break;
            if (line) {
                const parsedRule = line.match(ruleRegex);
                rules.push({name: parsedRule[1], intervals: [
                        {low: parseInt(parsedRule[2], 10), high: parseInt(parsedRule[3], 10),},
                        {low: parseInt(parsedRule[4], 10), high: parseInt(parsedRule[5], 10),},
                    ]});
            }
        }

        let myTicket: Ticket;
        for (i = i + 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/nearby tickets/)) break;
            if (line) myTicket = {values: line.split(',').map(v => parseInt(v, 10))};
        }

        const tickets: Ticket[] = [];
        for (i = i + 1; i < lines.length; i++) {
            const line = lines[i];
            if (line) tickets.push({values: line.split(',').map(v => parseInt(v, 10))});
        }

        return {rules, tickets, myTicket}
    }

    export function isValidTicket(ticket: Ticket, rules: TicketRule[]): boolean {
        let validTicket = true;
        ticket.values.forEach(value => {
            let valid = false;
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                if ((value >= rule.intervals[0].low && value <= rule.intervals[0].high)
                    || (value >= rule.intervals[1].low && value <= rule.intervals[1].high)) {
                    valid = true;
                    break;
                }
            }
            if (!valid) validTicket = valid;
        });
        return validTicket;
    }

    export function getInvalidRules(value: number, rules: TicketRule[]): TicketRule[] {
        return rules.filter(rule => !((value >= rule.intervals[0].low && value <= rule.intervals[0].high)
            || (value >= rule.intervals[1].low && value <= rule.intervals[1].high)));
    }

    export function part1(lines: string[]): number {
        const input = parseInput(lines);
        let totalInvalidSum = 0;
        input.tickets.forEach(ticket => {
            ticket.values.forEach(value => {
                let valid = false;
                for (let i = 0; i < input.rules.length; i++) {
                    const rule = input.rules[i];
                    if ((value >= rule.intervals[0].low && value <= rule.intervals[0].high)
                        || (value >= rule.intervals[1].low && value <= rule.intervals[1].high)) {
                        valid = true;
                        break;
                    }
                }
                if (!valid) totalInvalidSum += value;
            });
        });
        return totalInvalidSum;
    }

    export function part2(lines: string[]): number {
        const input = parseInput(lines);
        const validTickets = input.tickets
            .concat([input.myTicket])
            .filter(ticket => isValidTicket(ticket, input.rules));
        const toFindMappings = input.myTicket.values.length;
        const columns: {impossibleRules: {[ruleName: string]: TicketRule}, ruleName?: string}[]
            = input.myTicket.values.map(_ => ({impossibleRules: {}}));
        validTickets.forEach(ticket => {
           ticket.values.forEach((v, i) => {
                const invalidRules = getInvalidRules(v, input.rules);
                invalidRules.forEach(rule => columns[i].impossibleRules[rule.name] = rule);
           });
        });
        let foundMappings = 0;
        while (foundMappings < toFindMappings) {
            columns.forEach(column => {
                if (column.ruleName) return;
                if (Object.keys(column.impossibleRules).length === toFindMappings - 1) {
                    const rule = input.rules.find(x => !column.impossibleRules[x.name]);
                    column.ruleName = rule.name;
                    columns.forEach(c => c.impossibleRules[rule.name] = rule);
                    foundMappings++;
                }
            });
        }
        let output = 1;
        columns.forEach((column, index) => {
            if (column.ruleName.startsWith('departure')) {
                output = output * input.myTicket.values[index];
            }
        });
        return output;
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {

        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day16.example'), false);

        assert.equal(Y2020_Day16.part1(exampleLines), 71, 'example 1 part 1');

        assert.equal(Y2020_Day16.part2(exampleLines), 1, 'example 1 part 2')

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day16.input'), false);
        // part 1
        const part1Result = Y2020_Day16.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day16.part2(lines);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
