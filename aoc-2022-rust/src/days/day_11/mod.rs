use eval::eval;
use regex::Regex;
use std::mem::swap;

struct Item {
    worry_level: u64,
    history: Vec<usize>,
    start_value: u32,
    least_common_multiple: u32,
}

struct Monkey {
    items: Vec<Item>,
    operation_expression: String,
    monkey_test: MonkeyTest,
    inspect_count: u64,
}

struct MonkeyTest {
    divider: u32,
    true_monkey_id: u32,
    false_monkey_id: u32,
}

fn parse_input(input: &str) -> Vec<Monkey> {
    let monkey_regex = Regex::new(r"Monkey (\d+):\s+Starting items: ((\d+(,\s)?)*)\s+Operation: new = ([^\n]+)\s+Test: divisible by (\d+)\s+If true: throw to monkey (\d+)\s+If false: throw to monkey (\d+)").unwrap();
    let mut item_count: u32 = 0;
    let mut dividers: Vec<u32> = vec![];
    let mut monkeys = monkey_regex
        .captures_iter(input)
        .map(|captures| {
            let raw_starting_items = captures[2].to_string();
            let mut monkey_items: Vec<Item> = vec![];
            raw_starting_items.split(", ").for_each(|value| {
                let item = Item {
                    worry_level: value.parse::<u64>().unwrap(),
                    history: vec![],
                    start_value: value.parse::<u32>().unwrap(),
                    least_common_multiple: 0,
                };
                item_count += 1;
                monkey_items.push(item);
            });
            let operation_raw = &captures[5]; // 2 subgroups in the starting_items group 2 -> 5
            let divider = captures[6].parse::<u32>().unwrap();
            dividers.push(divider);
            let true_monkey_id = captures[7].parse::<u32>().unwrap();
            let false_monkey_id = captures[8].parse::<u32>().unwrap();
            Monkey {
                monkey_test: MonkeyTest {
                    divider,
                    false_monkey_id,
                    true_monkey_id,
                },
                operation_expression: operation_raw.to_string(),
                items: monkey_items,
                inspect_count: 0,
            }
        })
        .collect::<Vec<Monkey>>();

    let mut lcp: u32 = 1;
    dividers.iter().for_each(|x| lcp *= x);
    monkeys.iter_mut().for_each(|monkey| {
        monkey.items.iter_mut().for_each(|item| {
            item.least_common_multiple = item.start_value * lcp;
        });
    });

    monkeys
}

fn execute_round_2(mut monkeys: Vec<Monkey>) -> Vec<Monkey> {
    for i in 0..(monkeys.len()) {
        let mut targets: Vec<(Item, usize)> = vec![];
        {
            let monkey = monkeys.get_mut(i).unwrap();
            monkey.inspect_count += monkey.items.len() as u64;
            let mut current_items: Vec<Item> = vec![];
            swap(&mut current_items, &mut monkey.items);
            while !current_items.is_empty() {
                let mut item = current_items.remove(0);
                let mut worry_level = item.worry_level;
                let operation = monkey
                    .operation_expression
                    .replace("old", worry_level.to_string().as_str());
                worry_level = eval(operation.as_str())
                    .unwrap()
                    .to_string()
                    .parse::<u64>()
                    .unwrap();
                if (worry_level / item.least_common_multiple as u64) > 0 {
                    worry_level %= item.least_common_multiple as u64;
                }
                item.worry_level = worry_level;
                let is_divisible = item.worry_level % (monkey.monkey_test.divider as u64) == 0;
                let target_id = if is_divisible {
                    monkey.monkey_test.true_monkey_id
                } else {
                    monkey.monkey_test.false_monkey_id
                };
                targets.push((item, target_id as usize));
            }
        }
        while !targets.is_empty() {
            let mut target = targets.remove(0);
            target.0.history.push(target.1);
            let target_monkey = monkeys.get_mut(target.1).unwrap();
            target_monkey.items.push(target.0);
        }
    }
    monkeys
}

fn execute_round(mut monkeys: Vec<Monkey>) -> Vec<Monkey> {
    for i in 0..(monkeys.len()) {
        let mut targets: Vec<(Item, usize)> = vec![];
        {
            let monkey = monkeys.get_mut(i).unwrap();
            monkey.inspect_count += monkey.items.len() as u64;
            let mut current_items: Vec<Item> = vec![];
            swap(&mut current_items, &mut monkey.items);
            while !current_items.is_empty() {
                let mut item = current_items.remove(0);
                let mut worry_level = item.worry_level;
                let operation = monkey
                    .operation_expression
                    .replace("old", worry_level.to_string().as_str());
                worry_level = eval(operation.as_str())
                    .unwrap()
                    .to_string()
                    .parse::<u64>()
                    .unwrap();
                item.worry_level = worry_level / 3;
                let is_divisible = item.worry_level % (monkey.monkey_test.divider as u64) == 0;
                let target_id = if is_divisible {
                    monkey.monkey_test.true_monkey_id
                } else {
                    monkey.monkey_test.false_monkey_id
                };
                targets.push((item, target_id as usize));
            }
        }
        while !targets.is_empty() {
            let target = targets.remove(0);
            let target_monkey = monkeys.get_mut(target.1).unwrap();
            target_monkey.items.push(target.0);
        }
    }
    monkeys
}

#[test]
fn test_u32_division() {
    assert_eq!(10 / 3, 3);
    assert_eq!(10 % 3, 1);
}

fn part_1(input: &str) {
    let mut monkeys = parse_input(input);
    for _i in 0..20 {
        monkeys = execute_round(monkeys);
    }
    let mut monkey_inspects: Vec<u64> = vec![];
    monkeys
        .iter()
        .for_each(|monkey| monkey_inspects.push(monkey.inspect_count));
    monkey_inspects.sort_by(|a, b| b.cmp(a));
    assert!(monkey_inspects.len() >= 2);
    println!("{}", monkey_inspects[0] * monkey_inspects[1])
}

fn part_2(input: &str) {
    let mut monkeys = parse_input(input);
    for _i in 0..10000 {
        monkeys = execute_round_2(monkeys);
    }
    let mut monkey_inspects: Vec<u64> = vec![];
    monkeys
        .iter()
        .for_each(|monkey| monkey_inspects.push(monkey.inspect_count));
    monkey_inspects.sort_by(|a, b| b.cmp(a));

    assert!(monkey_inspects.len() >= 2);
    println!("{}", monkey_inspects[0] * monkey_inspects[1])
}

#[allow(dead_code)]
fn main() {
    let raw_input_example = include_str!("input.example");
    let raw_input = include_str!("input");

    println!("Part 1 - example input");
    part_1(raw_input_example);

    println!("Part 1 - input");
    part_1(raw_input);

    println!("Part 2 - example input");
    part_2(raw_input_example);

    println!("Part 2 - input");
    part_2(raw_input);
}
