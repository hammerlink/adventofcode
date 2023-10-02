use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};
use regex::Regex;

struct Elf {
    section_start: usize,
    section_end: usize,
}

struct ElfPair {
    elf_1: Elf,
    elf_2: Elf,
}

fn parse_input(input: &Vec<String>) -> Vec<ElfPair> {
    let mut output: Vec<ElfPair> = Vec::new();
    let re = Regex::new(r"(\d+)-(\d+),(\d+)-(\d+)").unwrap();
    for line in input.iter() {
        let re_match = re.captures(line).unwrap();
        output.push(ElfPair {
            elf_1: Elf {
                section_start: usize::from_str_radix(&re_match[1], 10).unwrap(),
                section_end: usize::from_str_radix(&re_match[2], 10).unwrap(),
            },
            elf_2: Elf {
                section_start: usize::from_str_radix(&re_match[3], 10).unwrap(),
                section_end: usize::from_str_radix(&re_match[4], 10).unwrap(),
            },
        });
    }
    output
}

fn is_elf_overlapped_by_elf(elf: &Elf, other_elf: &Elf) -> bool {
    if elf.section_start < other_elf.section_start {
        return false;
    }
    if elf.section_end > other_elf.section_end {
        return false;
    }
    true
}

fn is_pair_internally_fully_overlapping(pair: &ElfPair) -> bool {
    is_elf_overlapped_by_elf(&pair.elf_1, &pair.elf_2)
        || is_elf_overlapped_by_elf(&pair.elf_2, &pair.elf_1)
}

fn is_pair_internally_partly_overlapping(ElfPair { elf_1, elf_2, .. }: &ElfPair) -> bool {
    (elf_1.section_start >= elf_2.section_start && elf_1.section_start <= elf_2.section_end)
        || (elf_1.section_end <= elf_2.section_end && elf_1.section_end >= elf_2.section_start)
        || (elf_2.section_start >= elf_1.section_start && elf_2.section_start <= elf_1.section_end)
        || (elf_2.section_end <= elf_1.section_end && elf_2.section_end >= elf_1.section_start)
}

fn part_1(input: &Vec<String>) -> usize {
    let elf_pairs = parse_input(input);
    let result = elf_pairs
        .iter()
        .filter(|pair| is_pair_internally_fully_overlapping(pair))
        .map(|item| item.clone())
        .collect::<Vec<&ElfPair>>();
    let count = result.len();
    println!("{}", count);
    count
}

fn part_2(input: &Vec<String>) -> usize {
    let elf_pairs = parse_input(input);
    let result = elf_pairs
        .iter()
        .filter(|pair| is_pair_internally_partly_overlapping(pair))
        .map(|item| item.clone())
        .collect::<Vec<&ElfPair>>();
    let count = result.len();
    println!("{}", count);
    count
}

fn main() {
    let day_name = file!();
    let input = read_day_input(&day_name);
    let example_input = read_day_input_example(&day_name);

    println!("Part 1 - example input");
    assert_eq!(part_1(&example_input), 2);

    println!("Part 1 - input");
    part_1(&input);

    println!("Part 2 - example input");
    assert_eq!(part_2(&example_input), 4);

    println!("Part 2 - input");
    part_2(&input);
}
