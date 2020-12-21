const fs = require('fs');
const path = require('path');
const readline = require('readline');

export namespace FileEngine {

    export async function readFileToLines(filePath: string, ignoreEmpty = true): Promise<string[]> {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({input: fileStream, crlfDelay: Infinity});

        const lines: string[] = [];
        for await (const line of rl) {
            if (ignoreEmpty && !line) return lines;
            lines.push(line);
        }
        return lines;
    }
}

if (!module.parent) {
    FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/file.input'))
        .then(x => console.log(JSON.stringify(x)));
}
