import {FileEngine} from '../engine/file.engine';

export namespace Y2020_Day6 {

    export function getQuestionsReport(lines: string[]) {
        const questionsAnsweredPerGroup: { [key: string]: number } = {};
        const questionsAnsweredTotal: { [key: string]: number } = {};
        let totalCount = 0;
        let totalEveryoneCount = 0;

        let groupQuestions: { entries: number, [key: string]: number } = {entries: 0};
        const handleGroupQuestions = (groupQuestions: { [key: string]: number }) => {
            totalCount += Object.keys(groupQuestions).length - 1;
            for (const key in groupQuestions) {
                if (key === 'entries') continue;
                if (!questionsAnsweredTotal[key]) questionsAnsweredTotal[key] = 0;
                questionsAnsweredTotal[key]++;
                if (!questionsAnsweredPerGroup[key]) questionsAnsweredPerGroup[key] = 0;
                questionsAnsweredPerGroup[key] += groupQuestions[key];

                if (groupQuestions[key] === groupQuestions.entries) totalEveryoneCount++;
            }

        };
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length === 0) {
                handleGroupQuestions(groupQuestions);
                groupQuestions = {entries: 0};
            } else {
                groupQuestions.entries++;
                for (let c = 0; c < line.length; c++) {
                    if (!groupQuestions[line[c]]) groupQuestions[line[c]] = 0;
                    groupQuestions[line[c]]++;
                }
            }
        }
        handleGroupQuestions(groupQuestions);
        groupQuestions = {entries: 0};
        return {questionsAnsweredPerGroup, questionsAnsweredTotal, totalCount, totalEveryoneCount};
    }
}

if (!module.parent) {
    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day6.input'), false);
        const results = Y2020_Day6.getQuestionsReport(lines);
        console.log(results.totalCount, results.totalEveryoneCount)
    }

    main().catch(err => console.error(err));

}
