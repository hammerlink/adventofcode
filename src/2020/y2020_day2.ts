import {FileEngine} from '../engine/file.engine';
import {Day1} from '../days/day_1';

export namespace Y2020_Day2 {
    import calculateTotalRequiredFuel = Day1.calculateTotalRequiredFuel;

    export interface IPassword {
        min: number;
        max: number;
        char: string;
        passwordText: string;
    }

    export function convertInputToPassword(input: string): IPassword {
        const a = input.split(': ');
        const password = a[1];
        const metaParts = a[0].split(' ');
        const char = metaParts[1];
        const rangeParts = metaParts[0].split('-');
        const min = parseInt(rangeParts[0]);
        const max = parseInt(rangeParts[1]);
        return {min, max, char, passwordText: password};
    }

    export function isValidPassword(password: IPassword): boolean {
        let countChar = 0;
        for (let i = 0; i < password.passwordText.length; i++) {
            if (password.passwordText[i] === password.char) countChar++;
        }
        return countChar >= password.min && countChar <= password.max;
    }

    export function isValidTobogganPassword(password: IPassword): boolean {
        const text = password.passwordText;
        const first = text[password.min - 1] === password.char;
        const second = text[password.max - 1] === password.char;
        return ((first && !second) || (!first && second));

    }
}

if (!module.parent) {

    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day2.input'));
        const passwords = lines.map(Y2020_Day2.convertInputToPassword);

        console.log(passwords.filter(Y2020_Day2.isValidPassword).length);
        console.log(passwords.filter(Y2020_Day2.isValidTobogganPassword).length);
    }

    main().catch(err => console.error(err));

}
