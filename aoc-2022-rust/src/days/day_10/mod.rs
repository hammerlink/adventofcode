use crate::engine::input_engine::{read_day_input, read_day_input_example};

struct CathodeRayTube {
    tube_value: isize,
    cycle_counter: usize,
}

impl CathodeRayTube {
    pub fn new() -> Self {
        CathodeRayTube {
            tube_value: 1,
            cycle_counter: 1,
        }
    }
}

struct Command {
    command: String,
    value: Option<isize>,
}

impl Command {
    pub fn new(line: String) -> Self {
        let pieces: Vec<&str> = line.split(' ').collect();
        let command = pieces.first().unwrap().to_string();
        if command == "noop" {
            return Command {
                command,
                value: None,
            };
        }
        Command {
            command,
            value: Some(
                isize::from_str_radix(
                    {
                        let this = pieces.get(1).unwrap();
                        this
                    },
                    10,
                )
                .unwrap(),
            ),
        }
    }
}

#[test]
fn command_parser() {
    assert!(Command::new("noop".to_string()).command == "noop");
    let addx_cmd = Command::new("addx -21".to_string());
    assert!(addx_cmd.command == "addx");
    assert!(addx_cmd.value.unwrap() == -21);
}

fn execute_command(cathode: CathodeRayTube, command: &Command) -> CathodeRayTube {
    let mut output = cathode;
    match command.command.clone().as_str() {
        "noop" => output.cycle_counter += 1,
        "addx" => {
            output.cycle_counter += 2;
            output.tube_value += command.value.unwrap();
        }
        _ => panic!("command not found {}", command.command),
    }
    output
}

#[test]
fn test_execute_command() {
    let mut cathode = CathodeRayTube {
        tube_value: 0,
        cycle_counter: 0,
    };
    cathode = execute_command(cathode, &Command::new("addx -2".to_string()));
    assert_eq!(cathode.cycle_counter, 2);
    assert_eq!(cathode.tube_value, -2);
}

fn parse_input(input: &Vec<String>) -> Vec<Command> {
    input.iter().map(|x| Command::new(x.clone())).collect()
}

fn execute_cycle_trigger(cycle_trigger: &usize, tube_value: &isize) -> isize {
    println!("cycle {} tube {} - command", cycle_trigger, tube_value);
    *tube_value * (*cycle_trigger as isize)
}

fn part_1(input: &Vec<String>) {
    let mut cathode = CathodeRayTube::new();
    let mut cycle_triggers: Vec<usize> = vec![220, 180, 140, 100, 60, 20];

    let mut next_cycle_trigger = cycle_triggers.pop().unwrap();
    let mut check_trigger = true;
    let mut result: isize = 0;
    for (_i, command) in parse_input(input).iter().enumerate() {
        let previous_value = cathode.tube_value;
        let _started = cathode.cycle_counter;
        cathode = execute_command(cathode, command);
        if check_trigger && cathode.cycle_counter >= next_cycle_trigger {
            if cathode.cycle_counter == next_cycle_trigger {
                result += execute_cycle_trigger(&next_cycle_trigger, &cathode.tube_value);
            } else {
                result += execute_cycle_trigger(&next_cycle_trigger, &previous_value);
            }

            if !cycle_triggers.is_empty() {
                next_cycle_trigger = cycle_triggers.pop().unwrap();
            } else {
                check_trigger = false;
            }
        }
    }
    println!("{}", result)
}

fn get_cycle_visual() -> [bool; 40] {
    [false; 40]
}

fn print_cycle_visual(cycle_visual: &[bool; 40]) {
    let line = cycle_visual.iter().fold("".to_string(), |t, v| {
        if *v {
            return t + "#";
        }
        t + "."
    });
    println!("{}", line)
}

fn print_cycle_on_visual(
    cycle_visual: [bool; 40],
    tube_value: &isize,
    cycle: &usize,
) -> [bool; 40] {
    let mut output = cycle_visual;
    let current_cycle = *cycle % 40;
    let mut start: usize = 0;
    if current_cycle > 0 {
        start = current_cycle - 1;
    }
    for i in start..=(current_cycle + 1) {
        if i > 39 {
            continue;
        }
        output[i] = (*tube_value - (i as isize)).abs() <= 1;
    }
    output
}

#[test]
fn test_cycle_visual() {
    let mut cycle_visual = get_cycle_visual();
    cycle_visual = print_cycle_on_visual(cycle_visual, &4, &43);
    print_cycle_visual(&cycle_visual)
}

fn part_2(input: &Vec<String>) {
    let mut cathode = CathodeRayTube::new();
    let mut cycle_triggers: Vec<usize> = vec![240, 200, 160, 120, 80, 40];

    let mut next_cycle_trigger = cycle_triggers.pop().unwrap();
    let mut next_cycle_line = get_cycle_visual();
    for (_i, command) in parse_input(input).iter().enumerate() {
        let previous_value = cathode.tube_value;
        let current_command = command.command.clone();
        let started = cathode.cycle_counter;
        cathode = execute_command(cathode, command);
        // print tube on cycle
        if current_command == "addx" {
            if (started + 1) >= next_cycle_trigger && !cycle_triggers.is_empty() {
                next_cycle_trigger = cycle_triggers.pop().unwrap();
                print_cycle_visual(&next_cycle_line);
                next_cycle_line = get_cycle_visual();
            }
            next_cycle_line =
                print_cycle_on_visual(next_cycle_line, &previous_value, &(started + 1));
        }
        if cathode.cycle_counter >= next_cycle_trigger && !cycle_triggers.is_empty() {
            next_cycle_trigger = cycle_triggers.pop().unwrap();
            print_cycle_visual(&next_cycle_line);
            next_cycle_line = get_cycle_visual();
        }
        next_cycle_line =
            print_cycle_on_visual(next_cycle_line, &cathode.tube_value, &cathode.cycle_counter);
    }
    print_cycle_visual(&next_cycle_line);
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
