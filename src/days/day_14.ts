export namespace Day14 {
    export interface ReactionItem {amount: number; name: string;}

    export interface ChemicalReaction {
        inputs: ReactionItem[];
        outputs: ReactionItem[];
    }

    export function parseChemicalItem(line: string): ReactionItem {
        const parts = line.split(' ');
        return {
            amount: parseInt(parts[0], 10),
            name: parts[1],
        };
    }

    export function parseChemicalItems(line: string): ReactionItem[] {
        const parts = line.split(', ');
        return parts.map(parseChemicalItem);
    }

    export function parseChemicalReaction(line: string): ChemicalReaction {
        const parts = line.split('=> ');
        return {
            inputs: parseChemicalItems(parts[0]),
            outputs: parseChemicalItems(parts[1]),
        };
    }

    export function searchOptimalReactionCost(inputName: string, outputName: string, outputAmount: number,
                                              reactions: ChemicalReaction[], currentBestCost: number = null): number {
        let bestCost: number = null;
        for (let i = 0; i < reactions.length; i++) {
            const reaction = reactions[i];
            const desiredOutput = reaction.outputs.find(x => x.name === outputName);
            if (!desiredOutput) continue;

            let cost = 0;
            const reactionMultiplier = Math.ceil(outputAmount / desiredOutput.amount);

            for (let c = 0; c < reaction.inputs.length; c++) {
                const input = reaction.inputs[c];
                const requiredInputAmount = reactionMultiplier * input.amount;
                if (input.name !== inputName) cost += searchOptimalReactionCost(inputName, input.name, requiredInputAmount, reactions, bestCost);
                else cost += requiredInputAmount;
                if (bestCost !== null && cost > bestCost) break;
            }
            if (bestCost === null || cost < bestCost) bestCost = cost;
        }
        return bestCost;
    }
}
