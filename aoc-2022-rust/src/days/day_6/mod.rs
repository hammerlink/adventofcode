use crate::engine::input_engine::{read_day_input, read_day_input_example};
use std::ops::Index;

fn part_1(input: &Vec<String>) {
    let result = input.index(0);
    let mut fragment: Vec<char> = Vec::new();
    let mut parsed: usize = 0;
    for (i, c) in result.chars().enumerate() {
        if fragment.contains(&c) {
            fragment = Vec::new();
        }
        fragment.push(c);
        if fragment.len() >= 4 {
            parsed = i + 1;
            break;
        }
    }
    println!("{}", parsed);
}

fn part_2(input: &Vec<String>) {
    let result = input.index(0);
    for i in 14..=result.len() {
        if is_start_of_message_marker(&result[(i - 14)..i]) {
            println!("{}", i);
            return;
        }
    }
}

fn is_start_of_message_marker(piece: &str) -> bool {
    let mut fragment: Vec<char> = Vec::new();
    for c in piece.chars() {
        if fragment.contains(&c) {
            return false;
        }
        fragment.push(c);
    }
    true
}

#[allow(dead_code)]
fn main() {
    let day_name = file!();
    let input = read_day_input(day_name);
    let example_input = read_day_input_example(day_name);

    println!("Part 1 - example input");
    part_1(&example_input);

    println!("Part 1 - input");
    part_1(&input);

    println!("Part 2 - example input");
    part_2(&example_input);

    println!("Part 2 - input");
    part_2(&input);
}
