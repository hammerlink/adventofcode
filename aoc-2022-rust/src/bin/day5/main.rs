use std::borrow::{Borrow};
use std::collections::BTreeMap;
use std::ops::Add;
use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};
use lazy_static::lazy_static;
use regex::Regex;

struct Stack {
    stack_id: u32,
    crates: Vec<String>,
}

struct CraneCommand { 
    amount: usize,
    start_stack_id: u32,
    target_stack_id: u32,
}

fn parse_input(input: &Vec<String>) -> (BTreeMap<u32, Stack>, Vec<CraneCommand>) {
    let mut output: BTreeMap<u32, Stack> = BTreeMap::new();
    let mut stack_lines: Vec<&String> = Vec::new();
    let mut commands: Vec<CraneCommand> = Vec::new();

    // find stack_id line
    // make 2d array out of upper lines
    let mut is_past_stack = false;
    for line in input.iter() {
        if line.starts_with(" 1   2") {
            is_past_stack = true;
            output = parse_stack(&stack_lines, &line);
        }
        if !is_past_stack { stack_lines.push(line); }
        else if line.starts_with("move") { commands.push(parse_crane_command(line)); }

    }

    return (output, commands);
}

fn parse_stack(stack_lines: &Vec<&String>, stack_id_line: &String) -> BTreeMap<u32, Stack> {
    let mut output: BTreeMap<u32, Stack> = BTreeMap::new();
    for (i, c) in stack_id_line.chars().enumerate() {
        if !c.is_digit(10) {
            continue;
        }
        let stack = Stack {
            stack_id: c.to_digit(10).unwrap(),
            crates: stack_lines.iter().rev()
            .map(|line| line[i..(i+1)].to_string())
            .filter(|c| c != &" ")
            .collect::<Vec<String>>(),
        };
        output.insert(stack.stack_id, stack);
    }
    output
}

fn parse_crane_command(line: &String) -> CraneCommand {
    lazy_static! {
        static ref RE: Regex = Regex::new(r"move (\d+) from (\d+) to (\d+)").unwrap();
    }
    let cap = RE.captures(&line).unwrap();
    CraneCommand {
        amount: usize::from_str_radix(&cap[1], 10).unwrap(),
        start_stack_id: u32::from_str_radix(&cap[2], 10).unwrap(),
        target_stack_id: u32::from_str_radix(&cap[3], 10).unwrap(),
    }
}

#[test]
fn test_values() {
    let result = parse_crane_command(&"move 13 from 1 to 6".to_string());
    assert_eq!(result.amount, 13);
    assert_eq!(result.start_stack_id, 1);
    assert_eq!(result.target_stack_id, 6);
}


fn part_1(input: &Vec<String>) {
    let (mut supply_stack, commands) = parse_input(&input);
    for command in commands.iter() {
        for _ in 0..command.amount {
            let stack_crate = (*supply_stack.get_mut(&command.start_stack_id).unwrap()).crates.pop().unwrap();
            (*supply_stack.get_mut(&command.target_stack_id).unwrap()).crates.push(stack_crate);
        }
    }
    let mut output: String = "".to_string();
    for i in 0..supply_stack.values().len() {
        output = output.add(supply_stack.get(&u32::try_from(i + 1).unwrap()).unwrap().crates.last().unwrap());
    }
    println!("{}", output)
}

fn part_2(input: &Vec<String>) {
    let (mut supply_stack, commands) = parse_input(&input);
    for command in commands.iter() {
        let start_len = supply_stack.borrow().get(&command.start_stack_id).unwrap().crates.len();
        let stack_crate = (*supply_stack.get_mut(&command.start_stack_id).unwrap()).crates
            .split_off(start_len - command.amount);
        for i in stack_crate.iter() {
            (*supply_stack.get_mut(&command.target_stack_id).unwrap()).crates.push(i.clone());
        }
    }
    let mut output: String = "".to_string();
    for i in 0..supply_stack.values().len() {
        output = output.add(supply_stack.get(&u32::try_from(i + 1).unwrap()).unwrap().crates.last().unwrap());
    }
    println!("{}", output)
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
