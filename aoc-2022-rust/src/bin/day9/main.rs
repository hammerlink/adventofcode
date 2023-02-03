use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};

fn parse_input(input: &Vec<String>) -> usize {
    input.len()
}

fn part_1(input: &Vec<String>) {
    let result = parse_input(input);
    println!("{}", result)
}

fn part_2(input: &Vec<String>) {
    let result = parse_input(input);
    println!("{}", result)
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

