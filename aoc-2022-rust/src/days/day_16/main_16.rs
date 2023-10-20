use crate::days::day_16::valve::Valve;

use super::valve::{ValveMap, ValveMapTrait, ValveRoute};

fn parse_input(input: &str) -> ValveMap {
    let valves: Vec<Valve> = input
        .lines()
        .filter(|line| !line.is_empty())
        .map(|line| Valve::new(line))
        .collect();
    ValveMapTrait::new(valves)
}

#[allow(dead_code)]
fn part_1(input: &str) -> usize {
    let valve_map = parse_input(input);
    0
}
#[allow(dead_code)]
fn part_2(input: &str) -> usize {
    let _valves = parse_input(input);
    0
}

#[test]
fn day_16_part_1_example() {
    let raw_input_example = include_str!("input.example");
    let result = part_1(raw_input_example);
    println!("{}", result);
    assert_eq!(result, 1651);
}
#[test]
fn day_16_part_1() {
    let input = include_str!("input");
    let result = part_1(input);
    println!("{}", result);
    assert!(result > 4096105);
    assert_eq!(result, 4883971);
}
#[test]
fn day_16_part_2_example() {
    let input = include_str!("input.example");
    assert_eq!(part_2(input), 56000011);
}
#[test]
fn day_16_part_2() {
    let input = include_str!("input");
    let result = part_2(input);
    println!("{}", result);
    assert_eq!(result, 12691026767556);
}
