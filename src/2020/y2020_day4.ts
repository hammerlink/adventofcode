import { FileEngine } from "../engine/file.engine";

export namespace Y2020_Day4 {
  export const requiredFields = [
    "byr",
    "iyr",
    "eyr",
    "hgt",
    "hcl",
    "ecl",
    "pid",
  ];
  export const optionalFields = ["cid"];

  export interface IPassPort {
    [property: string]: string;
  }

  export function convertToPassport(lines: string[]): IPassPort {
    const output: IPassPort = {};
    lines.forEach((line) => {
      const parts = line.split(" ");
      parts.forEach((part) => {
        const pair = part.split(":");
        output[pair[0]] = pair[1];
      });
    });
    return output;
  }

  export function isValidPassPort(passPort: IPassPort): boolean {
    for (let i = 0; i < requiredFields.length; i++)
      if (passPort[requiredFields[i]] === undefined) return false;
    return true;
  }

  export function isValidPassPortPart2(passPort: IPassPort): boolean {
    for (let i = 0; i < requiredFields.length; i++)
      if (passPort[requiredFields[i]] === undefined) return false;
    const byr = parseInt(passPort.byr);
    if (!passPort.byr.match(/\d{4}/) || byr < 1920 || byr > 2002) return false;
    const iyr = parseInt(passPort.iyr);
    if (!passPort.iyr.match(/\d{4}/) || iyr < 2010 || iyr > 2020) return false;
    const eyr = parseInt(passPort.eyr);
    if (!passPort.eyr.match(/\d{4}/) || eyr < 2020 || eyr > 2030) return false;
    if (!passPort.hgt.match(/^\d+(in|cm)$/)) return false;
    if (passPort.hgt.indexOf("cm") > -1) {
      const heightCm = parseInt(passPort.hgt.replace("cm", ""));
      if (heightCm < 150 || heightCm > 193) return false;
    }
    if (passPort.hgt.indexOf("in") > -1) {
      const heightInch = parseInt(passPort.hgt.replace("in", ""));
      if (heightInch < 59 || heightInch > 76) return false;
    }
    if (!passPort.hcl.match(/^#([0-9]|[a-f]){6}$/)) return false;
    const colours = ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"];
    if (!colours.includes(passPort.ecl)) return false;
    if (!passPort.pid.match(/^[0-9]{9}$/)) return false;
    return true;
  }

  export function getPassPorts(lines: string[]): IPassPort[] {
    const passPorts: IPassPort[] = [];
    let currentSection: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length === 0) {
        if (currentSection.length)
          passPorts.push(convertToPassport(currentSection));
        currentSection = [];
      } else currentSection.push(line);
    }
    if (currentSection.length)
      passPorts.push(convertToPassport(currentSection));
    return passPorts;
  }
}

if (!module.parent) {
  const path = require("path");

  async function main() {
    const lines = await FileEngine.readFileToLines(
      path.join(path.dirname(__filename), "./data/y2020_day4.input"),
      false,
    );
    const startMs = Date.now();
    for (let i = 0; i < 1000; i++) {
      const data = Y2020_Day4.getPassPorts(lines);

      const part1List = data.filter(Y2020_Day4.isValidPassPort);
      console.log(Date.now() - startMs, "ms");
      console.log("part 1", part1List.length);
      const part2List = part1List.filter(Y2020_Day4.isValidPassPortPart2);
    }
    const startMs = Date.now();
    console.log(Date.now() - startMs, "ms");
    console.log("part 12", part2List.length);
  }

  main().catch((err) => console.error(err));
}
