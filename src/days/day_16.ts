export namespace Day16 {
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

    export function executePhases(input: string, repeatPattern: number[], count: number): string {
        let current = input;
        for (let i = 0; i < 100; i++) {
            current = executePhase(current, repeatPattern);
        }
        return current.slice(0, 8);
    }


}

if (!module.parent) {
    const input = '59773419794631560412886746550049210714854107066028081032096591759575145680294995770741204955183395640103527371801225795364363411455113236683168088750631442993123053909358252440339859092431844641600092736006758954422097244486920945182483159023820538645717611051770509314159895220529097322723261391627686997403783043710213655074108451646685558064317469095295303320622883691266307865809481566214524686422834824930414730886697237161697731339757655485312568793531202988525963494119232351266908405705634244498096660057021101738706453735025060225814133166491989584616948876879383198021336484629381888934600383957019607807995278899293254143523702000576897358';

    console.log('part 1', Day16.executePhases(input, [0, 1, 0, -1], 100));
}
