use regex::Regex;

// required library https://docs.rs/eval/latest/eval/

struct Item {
    worry_level: u32,
    monkey_id: Option<u32>,
}

struct Monkey {
    id: u32,
    items: Vec<Item>,
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
    let monkeys = monkey_regex.captures_iter(input).map(|captures| {
        let monkey_id = captures[1].parse::<u32>().unwrap(); // start at 1, 0 is the full capture
        let raw_starting_items = captures[2].to_string();
        let mut monkey_items: Vec<Item> = vec![];
        raw_starting_items
            .split(", ")
            .for_each(|value| {
                let item = Item {
                    worry_level: value.parse::<u32>().unwrap(),
                    monkey_id: Some(monkey_id),
                };
                monkey_items.push(item);
            });
        let operation_raw = &captures[5]; // 2 subgroups in the starting_items group 2 -> 5
        let divider = captures[6].parse::<u32>().unwrap();
        let true_monkey_id = captures[7].parse::<u32>().unwrap();
        let false_monkey_id = captures[8].parse::<u32>().unwrap();
        Monkey {
            id: monkey_id,
            monkey_test: MonkeyTest {
                divider,
                false_monkey_id,
                true_monkey_id,
            },
            operation_expression: operation_raw.to_string(),
            items: monkey_items,
        }
    }).collect::<Vec<Monkey>>();
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

