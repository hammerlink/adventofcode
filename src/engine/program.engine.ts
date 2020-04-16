export namespace ProgramEngine {
    export function compileProgram(input: string): number[] {
        return input.split(',').map(x => parseInt(x, 10));
    }
}
