export namespace Day16 {
    export const REPEAT_PATTERN = [0, 1, 0, -1];

    export function getRepeatingPatterns(repeatPattern: number[], size: number, position: number): number[] {
        const output: number[] = [];
        const requiredSize = size + 1;
        while (output.length < requiredSize) {
            for (let i = 0; i < repeatPattern.length; i++) {
                const value = repeatPattern[i];
                for (let j = 0; j <= position; j++) output.push(value);
            }
        }
        return output.slice(1, size + 1);
    }

    export function executePhase(input: string, repeatPattern: number[]): string {
        const numbers = input.split('').map(x => parseInt(x, 10));
        let output = '';
        for (let i = 0; i < numbers.length; i++) {
            const parsedRepeatPatterns = getRepeatingPatterns(repeatPattern, numbers.length, i);
            let total = 0;
            for (let j = 0; j < parsedRepeatPatterns.length; j++) {
                total += parsedRepeatPatterns[j] * numbers[j];
            }
            const result = `${total}`;
            output += parseInt(result[result.length - 1]);
        }
        return output;
    }

    export function executeFFTWithOffset(input: number[], count: number, repeater: number, repeatPattern: number[] = REPEAT_PATTERN): number[] {
        const offset = parseInt(input.slice(0, 7).reduce((t, v) => t + v, ''), 10);
        const totalLength = input.length * repeater;
        const halfRoundedDown = Math.floor(totalLength / 2);
        if (offset < halfRoundedDown) throw new Error('offset too low');

        let totalInput = [];
        for (let i = 0; i < repeater; i++) totalInput = totalInput.concat(input);
        let output: number[] = totalInput.slice(offset);
        for (let c = 0; c < count; c++) {
            let current: number[] = [];
            let buildup = 0;
            for (let i = output.length - 1; i >= 0; i--) {
                buildup = (buildup + output[i]) % 10;
                current[i] = Math.abs(buildup);
            }
            output = current;
        }
        return output.slice(0, 8);
    }

    export function executeOptimalPhases(input: number[], count: number, repeatPattern: number[] = REPEAT_PATTERN): number[] {
        let output: number[] = input;
        let startDate = new Date();
        for (let c = 0; c < count; c++) {
            // console.log('phase', c, startDate.getTime() - new Date().getTime());
            startDate = new Date();
            let current: number[] = [];
            let halfRoundedDown = Math.floor(output.length / 2);
            let lastBuildUp = 0;
            for (let m = 0; m < halfRoundedDown; m++) {
                // reverse
                const rIndex = output.length - 1 - m;
                lastBuildUp = (lastBuildUp + output[rIndex]) % 10;
                current[rIndex] = Math.abs(lastBuildUp);
                // normal
                let total = 0;
                const multiplier = m + 1;
                const repeatMultipliedLength = repeatPattern.length * multiplier;
                let currentIndex = multiplier - 1; // multiplier * 1 - 1
                while (currentIndex < output.length) {
                    // repeat index 1, 1
                    let maxIndex = currentIndex + multiplier;
                    if (maxIndex > output.length) maxIndex = output.length;
                    for (let i = currentIndex; i < maxIndex; i++) {
                        total += output[i];
                    }
                    // repeat index 3, -1
                    maxIndex = currentIndex + multiplier * 3;
                    if (maxIndex > output.length) maxIndex = output.length;
                    for (let i = currentIndex + multiplier * 2; i < maxIndex; i++) {
                        total -= output[i];
                    }

                    currentIndex += repeatMultipliedLength;
                }
                current[m] = (Math.abs(total % 10));
            }
            // if uneven add final
            if (current.length % 2 === 1) {
                lastBuildUp += output[halfRoundedDown];
                current[halfRoundedDown] = Math.abs(lastBuildUp);
            }
            output = current;
        }
        return output;
    }

    export function executePhases(input: string, repeatPattern: number[], count: number, fullOutput: boolean = false): string {
        let current = input;
        for (let i = 0; i < 100; i++) {
            current = executePhase(current, repeatPattern);
        }
        return !fullOutput ? current.slice(0, 8) : current;
    }

    export function getRepeatValue(repeatPattern: number[], multiplier: number, index: number): number {
        // const startIndex = index + 1;
        // const moddedIndex = startIndex % (repeatPattern.length * (multiplier + 1));
        // const repeatPatternIndex = Math.floor(moddedIndex / (multiplier + 1));
        // return repeatPattern[repeatPatternIndex];

        // single line for performance
        return repeatPattern[Math.floor(((index + 1) % (repeatPattern.length * (multiplier + 1))) / (multiplier + 1))];
    }

    export function getRepeatIndex(repeatPatternLength: number, multiplier: number, index: number): number {
        return Math.floor(((index + 1) % (repeatPatternLength * (multiplier + 1))) / (multiplier + 1));
    }

    export function printRepeatTable(messageLength: number, repeatPattern: number[] = REPEAT_PATTERN) {
        for (let m = 0; m < messageLength; m++) {
            let line = '';
            for (let i = 0; i < messageLength; i++) {
                let value = getRepeatValue(repeatPattern, m, i);
                line += (value >= 0 ? ' ' + value : value) + ' ';
            }
            console.log(line);
        }
    }


}

if (!module.parent) {
    const input = '59773419794631560412886746550049210714854107066028081032096591759575145680294995770741204955183395640103527371801225795364363411455113236683168088750631442993123053909358252440339859092431844641600092736006758954422097244486920945182483159023820538645717611051770509314159895220529097322723261391627686997403783043710213655074108451646685558064317469095295303320622883691266307865809481566214524686422834824930414730886697237161697731339757655485312568793531202988525963494119232351266908405705634244498096660057021101738706453735025060225814133166491989584616948876879383198021336484629381888934600383957019607807995278899293254143523702000576897358';
    console.log(input.length);
    const startDate = new Date().getTime();
    const inputN = input.split('').map(x => parseInt(x, 10));
    const resultPhase = Day16.executeOptimalPhases(input.split('').map(x => parseInt(x, 10)), 10003081770884921959731165446850517);
    console.log('part 1', resultPhase.slice(0, 8).reduce((total, value) => total + value, ''));
    console.log(new Date().getTime() - startDate, 'ms');

    console.log('part 2', Day16.executeFFTWithOffset(inputN, 100, 10000)
        .reduce((total, value) => total + value, ''));

    // let input2 = '';
    // for (let i = 0; i < 1000; i++) input2 += input;
}
