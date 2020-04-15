export namespace Day4 {
    export function isValidPassword(password: string): boolean {
        if (password.length !== 6) return false;
        const passwordDigits: number[] = password.split('').map(x => parseInt(x, 10));
        let hasAdjacentIdenticalDigits = false;
        let previousDigit = passwordDigits[0];
        for (let i = 1; i < 6; i++) {
            const currentDigit = passwordDigits[i];
            if (currentDigit < previousDigit) return false;
            if (currentDigit === previousDigit) hasAdjacentIdenticalDigits = true;
            previousDigit = currentDigit;
        }
        return hasAdjacentIdenticalDigits;
    }

    export function isValidPasswordPart2(password: string): boolean {
        if (password.length !== 6) return false;
        const passwordDigits: number[] = password.split('').map(x => parseInt(x, 10));
        const adjacentCount: { [digit: number]: number } = {};
        let previousDigit = passwordDigits[0];
        for (let i = 1; i < 6; i++) {
            const currentDigit = passwordDigits[i];
            if (currentDigit < previousDigit) return false;
            if (currentDigit === previousDigit) {
                if (!adjacentCount[currentDigit]) adjacentCount[currentDigit] = 1;
                adjacentCount[currentDigit]++;
            }
            previousDigit = currentDigit;
        }
        for (const key in adjacentCount) {
            if (adjacentCount[key] === 2) return true;
        }
        return false;
    }

    export function countValidPasswordsInRange(min: number, max: number) {
        let total = 0;
        for (let i = min; i <= max; i++) {
            if (isValidPassword(`${i}`)) total++;
        }
        return total;
    }

    export function countValidPart2PasswordsInRange(min: number, max: number) {
        let total = 0;
        for (let i = min; i <= max; i++) {
            if (isValidPasswordPart2(`${i}`)) total++;
        }
        return total;
    }
}

if (!module.parent) {
    console.log(Day4.countValidPasswordsInRange(284639, 748759));
    console.log(Day4.countValidPart2PasswordsInRange(284639, 748759));
}
