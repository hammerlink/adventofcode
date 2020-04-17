import {ProgramEngine} from "../engine/program.engine";
import {ProgramManager} from "../manager/program.manager";

export namespace Day9 {

}

if (!module.parent) {
    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');

    async function main() {
        const fileStream = fs.createReadStream(path.join(path.dirname(__filename), '../data/day_9.input'));
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        for await (const line of rl) {
            if (!line) return;
            const intCodes = ProgramEngine.compileProgram(line);
            // part 1
            const program = new ProgramManager(intCodes);
            program.getInput = async () => 1;
            program.writeOutput = (output) => console.log('part 1', output);
            await program.executeProgram();
        }
    }

    main().then(console.log).catch(err => console.error(err));
}
