export namespace Day14 {
    export const DEFAULT_INPUT = 'ORE';
    export const DEFAULT_OUTPUT = 'FUEL';
    export const DEFAULT_MAX_INPUT = 1000000000000;

    export interface ReactionItem {
        amount: number;
        name: string;
    }

    export interface ChemicalReaction {
        inputs: ReactionItem[];
        outputs: ReactionItem[];
    }

    export interface Residue {
        total: number;
        residue: number;
    }

    export interface ReagentList {
        [reagent: string]: Residue;
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

    export function fetchReagent(reagentList: ReagentList, reagentName: string, amount: number,
                                 addToTotal: boolean): number {
        if (!reagentList[reagentName]) reagentList[reagentName] = {total: 0, residue: 0};
        const reagent = reagentList[reagentName];
        let requiredAmount = amount;
        if (reagent.residue > 0) {
            if (reagent.residue >= requiredAmount) {
                reagent.residue -= requiredAmount;
                requiredAmount = 0;
            } else {
                requiredAmount -= reagent.residue;
                reagent.residue = 0;
            }
        }
        if (requiredAmount > 0 && addToTotal) {
            reagent.total += requiredAmount;
            requiredAmount = 0;
        }
        return requiredAmount; // returning amount that still needs to be obtained
    }

    export function buildReactionTree(reactions: ChemicalReaction[]): string[][] {
        const levels: string[][] = [[DEFAULT_INPUT]];
        const reagentMemory: string[] = [DEFAULT_INPUT];

        const getReactionsInLevel = (): ChemicalReaction[] => {
            const levelReactions: ChemicalReaction[] = [];
            for (let i = 0; i < reactions.length; i++) {
                const reaction = reactions[i];
                const outputName = reaction.outputs[0].name;
                if (reagentMemory.indexOf(outputName) > -1) continue;

                // only push reaction if all inputs are present in the memory
                let hasAllInputs = true;
                for (let ri = 0; ri < reaction.inputs.length; ri++) {
                    const input = reaction.inputs[ri];
                    if (reagentMemory.indexOf(input.name) === -1) {
                        hasAllInputs = false;
                        break;
                    }
                }
                if (hasAllInputs) levelReactions.push(reaction);
            }
            return levelReactions;
        };
        let currentReactionLevel = getReactionsInLevel();
        while (currentReactionLevel.length !== 0) {
            const currentLevel: string[] = [];
            currentReactionLevel.forEach(reaction => {
                currentLevel.push(reaction.outputs[0].name);
                reagentMemory.push(reaction.outputs[0].name);
            });
            levels.push(currentLevel);
            currentReactionLevel = getReactionsInLevel();
        }
        return levels;
    }

    export interface ReagentMap {
        [reagentName: string]: {
            inputReactions: ChemicalReaction[];
            outputReactions: ChemicalReaction[];
        }
    }

    export function buildReagentMap(reactions: ChemicalReaction[]): ReagentMap {
        const output: ReagentMap = {};
        reactions.forEach(reaction => {
            reaction.inputs.forEach(input => {
                const reagentName = input.name;
                if (!output[reagentName]) output[reagentName] = {inputReactions: [], outputReactions: []};
                output[reagentName].inputReactions.push(reaction);
            });
            reaction.outputs.forEach(outputReaction => {
                const reagentName = outputReaction.name;
                if (!output[reagentName]) output[reagentName] = {inputReactions: [], outputReactions: []};
                output[reagentName].outputReactions.push(reaction);
            });
        });
        return output;
    }

    export function printReactionsInformation(reactions: ChemicalReaction[]) {
        const bestReagentList = searchOptimalReactionCost(DEFAULT_INPUT, DEFAULT_OUTPUT, 1, reactions);
        const reactionTree = Day14.buildReactionTree(reactions);
        reactionTree.forEach(line => console.log(JSON.stringify(line)));

        const reagentMap = Day14.buildReagentMap(reactions);
        for (let level = 0; level < reactionTree.length; level++) {
            console.log('___________________________________', level, '___________________________________');
            const reactionTreeLevel = reactionTree[level];
            reactionTreeLevel.forEach(reagentName => {
                const reagent = reagentMap[reagentName];
                console.log(reagentName, JSON.stringify(bestReagentList[reagentName]),
                    'inputs', reagent.inputReactions.length,
                    'outputs', reagent.outputReactions.length,
                );
            });
        }
    }

    export function searchMaximalReactionOutput(reactions: ChemicalReaction[]): number {
        const reagentList: ReagentList = {};
        reagentList[DEFAULT_INPUT] = {total: DEFAULT_MAX_INPUT, residue: DEFAULT_MAX_INPUT};

        const reagentMap = buildReagentMap(reactions);

        function executeReaction(reaction: ChemicalReaction, amount: number): boolean {
            const desiredOutput = reaction.outputs[0]; // always maximal 1 output
            const reactionMultiplier = Math.ceil(amount / desiredOutput.amount);

            for (let i = 0; i < reaction.inputs.length; i++) {
                const inputReagent = reaction.inputs[i];
                let requiredInputAmount = inputReagent.amount * reactionMultiplier;
                requiredInputAmount = fetchReagent(reagentList, inputReagent.name, requiredInputAmount, false);
                if (requiredInputAmount > 0) {
                    if (inputReagent.name === DEFAULT_INPUT) return false;
                    const createInputReaction = reagentMap[inputReagent.name].outputReactions[0]; // should exist
                    if (!executeReaction(createInputReaction, requiredInputAmount)) {
                        return false;
                    }
                    requiredInputAmount = fetchReagent(reagentList, inputReagent.name, requiredInputAmount, false);
                    if (requiredInputAmount !== 0) throw new Error('something went wrong');
                }
            }
            reaction.outputs.forEach(outputReagent => {
                if (!reagentList[outputReagent.name]) reagentList[outputReagent.name] = {total: 0, residue: 0};
                const outputAmount = outputReagent.amount * reactionMultiplier;
                reagentList[outputReagent.name].total += outputAmount;
                reagentList[outputReagent.name].residue += outputAmount;
            });
            return true;
        }

        const fuelReaction = reagentMap[DEFAULT_OUTPUT].outputReactions[0];
        let fuelCounter = 0;
        const optimalReaction = searchOptimalReactionCost(DEFAULT_INPUT, DEFAULT_OUTPUT, 1, reactions);
        const maxOptimalOutput = Math.floor(DEFAULT_MAX_INPUT / optimalReaction[DEFAULT_INPUT].total);
        executeReaction(fuelReaction, maxOptimalOutput);
        fuelCounter = maxOptimalOutput;
        while (executeReaction(fuelReaction, 1)) {
            fuelCounter++;
        }

        return fuelCounter;
    }

    export function searchOptimalReactionCost(inputName: string, outputName: string, outputAmount: number,
                                              reactions: ChemicalReaction[], reagentList: ReagentList = {}
    ): ReagentList {
        let bestTotalInput: number = null;
        let bestReagentList: ReagentList = null;

        for (let i = 0; i < reactions.length; i++) {
            const reaction = reactions[i];
            const desiredOutput = reaction.outputs.find(x => x.name === outputName);
            if (!desiredOutput) continue;

            let currentReagentList: ReagentList = JSON.parse(JSON.stringify(reagentList));
            const requiredOutputAmount = fetchReagent(currentReagentList, outputName, outputAmount, false);
            const reactionMultiplier = Math.ceil(requiredOutputAmount / desiredOutput.amount);
            const totalOutputAmount = desiredOutput.amount * reactionMultiplier;
            const residueOutputAmount = totalOutputAmount - requiredOutputAmount;

            for (let c = 0; c < reaction.inputs.length; c++) {
                const input = reaction.inputs[c];
                let requiredInputAmount = reactionMultiplier * input.amount;
                // use any residue available
                if (currentReagentList[input.name] && currentReagentList[input.name].residue) {
                    requiredInputAmount = fetchReagent(currentReagentList, inputName, requiredInputAmount, false);
                }
                // fetch input resources
                if (requiredInputAmount !== 0) {
                    if (input.name !== inputName) currentReagentList = searchOptimalReactionCost(inputName, input.name,
                        requiredInputAmount, reactions, currentReagentList);
                    else {
                        fetchReagent(currentReagentList, inputName, requiredInputAmount, true);
                    }
                }
            }

            // add missing output to the reagent list
            fetchReagent(currentReagentList, outputName, totalOutputAmount, true);
            currentReagentList[outputName].residue += residueOutputAmount;

            const totalInput = currentReagentList[inputName].total;
            if (bestTotalInput === null || totalInput < bestTotalInput) {
                bestTotalInput = totalInput;
                bestReagentList = currentReagentList;
            }
        }

        return bestReagentList;
    }
}

if (!module.parent) {
    const lines = [
        '15 RNMTG => 6 QSXV',
        '21 MKJN => 9 KDFZ',
        '1 KVFL, 4 NZWL => 3 FHDT',
        '1 FZJXD, 2 SWZK, 1 QRLRS => 6 ZRNK',
        '8 KVFL => 6 SBZKF',
        '11 DXFB, 1 CPBXJ, 8 TXFCS, 1 ZPMHL, 1 BCHTD, 2 FZJXD, 2 WKZMQ, 1 NZWL => 8 MPLJ',
        '5 KDFZ, 1 QSXV => 9 TXFCS',
        '1 PMLGM, 21 CKVN => 3 KVFL',
        '1 XFRLH, 3 QRLRS => 4 CKVN',
        '5 KBJS, 15 XFRLH, 6 WZPZX, 15 KVFL, 4 DXFB, 4 ZPMHL, 11 JCKCK, 26 KFGPB => 9 BWVS',
        '10 KNRDW, 2 XCML => 9 BCNL',
        '26 LBLH => 9 KBJS',
        '5 DTFBQ, 4 PJTD => 6 FHKSW',
        '6 HTRFP, 1 FVXV, 4 JKLNF, 1 TXFCS, 2 PXBP => 4 JRBFT',
        '21 DTFBQ => 9 JGQJ',
        '2 KBJS => 3 FZJXD',
        '24 LBLH => 6 QFMTZ',
        '1 CBNJT => 7 LSCW',
        '5 KVFL => 2 NZWL',
        '12 DNHL, 4 BCNL => 4 LBLH',
        '15 RHVG => 1 PJCWT',
        '4 KDFZ, 1 KVFL => 3 BCHTD',
        '2 XFDW, 7 BCHTD => 7 WKZMQ',
        '2 SBZKF, 1 PLTX => 3 DXFB',
        '1 PLTX, 11 HTRFP, 6 PMLGM => 1 JCKCK',
        '1 TQCX, 10 DNHL => 8 DTFBQ',
        '2 TQCX, 2 KTBFB => 5 RHVG',
        '8 MVFW => 3 CPBXJ',
        '148 ORE => 4 CBNJT',
        '9 CPBXJ, 5 DTFBQ => 6 PMLGM',
        '11 ZXCF, 15 PJCWT, 4 FZJXD => 7 PJTD',
        '1 JGQJ => 6 DCBNV',
        '4 LSCW, 16 BCNL => 7 MVFW',
        '1 RHVG => 4 XFDW',
        '8 MPLJ, 16 JRBFT, 43 KBJS, 11 NZWL, 4 BWVS, 22 ZPMHL => 1 FUEL',
        '1 QFMTZ, 3 CKVN => 5 PLTX',
        '5 CKVN, 10 SWZK => 7 HTRFP',
        '2 PXBP, 1 QRLRS, 7 KTBFB => 7 NDZGV',
        '1 QRLRS, 9 KBJS, 2 TQCX => 2 SWZK',
        '9 TZKZ, 3 ZRNK, 4 PXBP => 4 FVXV',
        '1 PMLGM, 1 SWZK, 6 FZJXD => 7 MKJN',
        '16 MVFW, 2 KBJS => 7 ZXCF',
        '1 MVFW => 6 HVGF',
        '1 LSCW, 1 HVGF => 8 RNMTG',
        '5 ZRNK, 1 TQCX => 3 PXBP',
        '130 ORE => 5 KNRDW',
        '1 RHVG, 2 KFGPB, 1 LSCW => 7 QRLRS',
        '6 XFRLH => 8 TZKZ',
        '24 HVGF, 8 KTBFB => 1 XFRLH',
        '2 KNRDW, 2 CBNJT => 6 DNHL',
        '1 FHDT => 4 JKLNF',
        '1 QSXV, 10 XFGZX, 2 DCBNV => 8 ZPMHL',
        '1 FHDT, 7 NDZGV => 4 WZPZX',
        '11 FHKSW => 5 XFGZX',
        '10 LSCW => 8 KTBFB',
        '133 ORE => 1 XCML',
        '8 XCML => 4 TQCX',
        '6 CPBXJ, 8 CBNJT => 6 KFGPB',
    ];
    const reactions = lines.map(Day14.parseChemicalReaction);
    const bestReagentList = Day14.searchOptimalReactionCost('ORE', 'FUEL', 1, reactions);
    console.log('part 1', bestReagentList['ORE'].total);

    // Day14.printReactionsInformation(reactions);

    console.log('part 2', Day14.searchMaximalReactionOutput(reactions));
}
