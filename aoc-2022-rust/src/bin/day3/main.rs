use std::ops::Index;
use substring::Substring;
use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};

#[derive(Clone)]
struct RuckSack {
    compartment_1: Vec<u32>,
    compartment_2: Vec<u32>,
}

fn parse_input(input: &Vec<String>) -> Vec<RuckSack> {
    input.iter()
        .map(|x| convert_raw_line_to_ruck_sack(x))
        .collect()
}

fn convert_raw_line_to_ruck_sack(input: &String) -> RuckSack {
    let halves = split_line_in_half(input);
    RuckSack {
        compartment_1: convert_ruck_sack_line(halves.0),
        compartment_2: convert_ruck_sack_line(halves.1),
    }
}

fn split_line_in_half(input: &String) -> (&str, &str) {
    let line_len = input.len();
    assert_eq!(line_len % 2, 0);
    (input.substring(0, line_len / 2), input.substring(line_len / 2, line_len))
}

fn convert_ruck_sack_line(input: &str) -> Vec<u32> {
    input.chars()
        .map(|x| convert_rucksack_char_to_priority(x))
        .collect()
}

fn convert_rucksack_char_to_priority(input: char) -> u32 {
    let value = input as u32;
    if value >= 97 { return value - 96; }
    return value - (65 - 27);
}

fn find_wrong_rucksack_item(rucksack: &RuckSack) -> u32 {
    let compartment1_matches: Vec<&u32> = rucksack.compartment_1.iter().filter(|x| rucksack.compartment_2.contains(x)).collect();
    if compartment1_matches.len() > 0 { return compartment1_matches[0].clone(); }
    rucksack.compartment_2.iter().find(|x| rucksack.compartment_1.contains(x)).unwrap().clone()
}

fn part_1(input: &Vec<String>) {
    let result = parse_input(input)
        .iter()
        .map(|x| find_wrong_rucksack_item(x))
        .fold(0, |total, value| total + value);

    println!("{}", result)
}

fn find_shared_priority(input: &Vec<RuckSack>) -> u32 {
    let mut remaining_prios: Vec<u32> = Vec::new();
    for (i, ruck_sack) in input.iter().enumerate() {
        if i == 0 {
            for c_type in ruck_sack.compartment_1.iter() {
                if !remaining_prios.contains(c_type) { remaining_prios.push(c_type.clone()); }
            }
            for c_type in ruck_sack.compartment_2.iter() {
                if !remaining_prios.contains(c_type) { remaining_prios.push(c_type.clone()); }
            }
            continue;
        }
        for (i, c_type) in remaining_prios.clone().iter().enumerate() {
            if !ruck_sack.compartment_1.contains(c_type) && !ruck_sack.compartment_2.contains(c_type) {
remaining_prios.remove(remaining_prios.iter().position(|x| x == c_type).unwrap());
            }
        }
    }
    assert_eq!(remaining_prios.len(), 1);
    return remaining_prios[0];
}

fn part_2(input: &Vec<String>) {
    let result = parse_input(input);
    let mut i = 0usize;
    let mut total = 0u32;
    loop {
        let elf_group = &result[i..(i + 3)].to_vec();
        total += find_shared_priority(elf_group);
        i += 3;
        if i >= result.len() { break; }
    }

    println!("{}", total)
}

fn main() {
    let day_name = file!();
    let input = read_day_input(&day_name);
    let example_input = read_day_input_example(&day_name);

    println!("Part 1 - example input");
    part_1(&example_input);

    println!("Part 1 - input");
    part_1(&input);

    println!("Part 2 - example input");
    part_2(&example_input);

    println!("Part 2 - input");
    part_2(&input);
}

#[cfg(test)]
mod convert_rucksack_char_to_priority {
    use super::convert_rucksack_char_to_priority;

    #[test]
    fn test_values() {
        assert_eq!(convert_rucksack_char_to_priority('A'), 27);
        assert_eq!(convert_rucksack_char_to_priority('Z'), 52);
        assert_eq!(convert_rucksack_char_to_priority('a'), 1);
        assert_eq!(convert_rucksack_char_to_priority('z'), 26);
    }
}

#[cfg(test)]
mod split_line_in_half {
    use super::split_line_in_half;

    #[test]
    fn test_values() {
        let input: String = "vJrwpWtwJgWrhcsFMMfFFhFp".to_string();
        let split = split_line_in_half(&input);
        assert_eq!(split.0, "vJrwpWtwJgWr");
        assert_eq!(split.1, "hcsFMMfFFhFp");
    }
}

