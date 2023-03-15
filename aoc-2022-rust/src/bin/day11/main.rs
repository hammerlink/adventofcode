use regex::Regex;

// required library https://docs.rs/eval/latest/eval/

struct Item {
    id: u32,
    monkey_id: Option<u32>,
}

struct Monkey {
    id: u32,
    starting_items: Vec<usize>,
    operation_expression: String,
    monkey_test: MonkeyTest,
}

struct MonkeyTest {
    divider: u32,
    true_monkey_id: u32,
    false_monkey_id: u32,
}


fn parse_input(input: &str) -> usize {
    let monkey_regex = Regex::new(r"Monkey (\d+):\s+Starting items: ((\d+(,\s)?)*)\s+Operation: ([^\n]+)\s+Test: divisible by (\d+)\s+If true: throw to monkey (\d+)\s+If false: throw to monkey (\d+)").unwrap();
    monkey_regex.find_iter(input).for_each(|monkey_match|  {
        let captures = monkey_regex.captures(monkey_match.as_str()).unwrap();
        let monkey_id = &captures[1]; // start at 1, 0 is the full capture
        let starting_items = &captures[2];
        let operation_raw = &captures[5]; // 2 subgroups in the starting_items group 2 -> 5
        let divider = &captures[6];
        let true_monkey_id = &captures[7];
        let false_monkey_id = &captures[8];
        println!("{} - {} - {} - {} - {} - {}", monkey_id, starting_items, operation_raw, divider, true_monkey_id, false_monkey_id)
    });
    input.len()
}

fn part_1(input: &str) {
    let result = parse_input(input);
    println!("{}", result)
}

// fn part_2(input: &Vec<String>) {
//     let result = parse_input(input);
//     println!("{}", result)
// }

fn main() {
    let raw_input_example = include_str!("input.example");
    let raw_input = include_str!("input");

    println!("Part 1 - example input");
    part_1(raw_input_example);

    println!("Part 1 - input");
    part_1(raw_input);

    // println!("Part 2 - example input");
    // part_2(&example_input);
    //
    // println!("Part 2 - input");
    // part_2(&input);
}

