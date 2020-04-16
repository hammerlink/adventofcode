export interface ParameterOpCode {
    opCode: number;
    parameterModes: [number, number, number];
}

export namespace ProgramEngine {

    export function compileProgram(input: string): number[] {
        return input.split(',').map(x => parseInt(x, 10));
    }

    export function parseParameterOpCode(rawParameterOpCode: number): ParameterOpCode {
        let stringCode = '' + rawParameterOpCode;
        while (stringCode.length < 5) stringCode = '0' + stringCode;
        return {
            opCode: parseInt(stringCode.substr(3), 10),
            parameterModes: [
                parseInt(stringCode.substr(2, 1), 10),
                parseInt(stringCode.substr(1, 1), 10),
                parseInt(stringCode.substr(0, 1), 10),
            ]
        };
    }

    export function getExecutionParameter(codes: number[], currentIndex: number,
                                          opCode: ParameterOpCode, parameterIndex: number): number {
        const codeParameterIndex = codes[currentIndex + parameterIndex + 1];
        return opCode.parameterModes[parameterIndex] === 0 ? codes[codeParameterIndex] : codeParameterIndex;
    }
}
