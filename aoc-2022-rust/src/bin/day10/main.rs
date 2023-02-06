use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};

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
    raw: String,
}

impl Command {
    pub fn new(line: String) -> Self {
       let pieces: Vec<&str> = line.split(" ").collect(); 
       let command = pieces.get(0).unwrap().to_string(); 
       if command == "noop" {
           return Command {
               command,
               value: None,
               raw: line.clone(),
           };
       }
       Command { command, value: Some(isize::from_str_radix(pieces.get(1).unwrap().clone(), 10).unwrap()), raw: line.clone() }
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
        },
        _ => panic!("command not found {}", command.command),
    }
    output
}

#[test]
fn test_execute_command() {
    let mut cathode = CathodeRayTube { tube_value: 0, cycle_counter: 0};
    cathode = execute_command(cathode, &Command::new("addx -2".to_string()));
    assert_eq!(cathode.cycle_counter, 2);
    assert_eq!(cathode.tube_value, -2);
}

fn parse_input(input: &Vec<String>) -> Vec<Command> {
    input.iter().map(|x| Command::new(x.clone())).collect()
}

fn execute_cycle_trigger(cycle_trigger: &usize, tube_value: &isize) -> isize {
    println!("cycle {} tube {} - command", cycle_trigger, tube_value);
    tube_value.clone() * (cycle_trigger.clone() as isize)
}

fn part_1(input: &Vec<String>) {
    let mut cathode = CathodeRayTube::new();
    let mut cycle_triggers: Vec<usize> = vec![220, 180, 140, 100, 60, 20];

    let mut next_cycle_trigger = cycle_triggers.pop().unwrap();
    let mut check_trigger = true;
    let mut result: isize = 0;
    for (i, command) in parse_input(input).iter().enumerate() {
        let previous_value = cathode.tube_value.clone();
        let started = cathode.cycle_counter.clone();
        cathode = execute_command(cathode, command);
        if check_trigger && cathode.cycle_counter >= next_cycle_trigger {
            // println!("cycle {} tube {} - command {}  preivous value{}  cycle-start: {}", cathode.cycle_counter, cathode.tube_value, command.raw, &previous_value, &started);
            if cathode.cycle_counter == next_cycle_trigger {
                result += execute_cycle_trigger(&next_cycle_trigger, &cathode.tube_value);
            } else {
                result += execute_cycle_trigger(&next_cycle_trigger, &previous_value);
            }


            if cycle_triggers.len() > 0 {
                next_cycle_trigger = cycle_triggers.pop().unwrap();
            } else {
                check_trigger = false;
            }
        }
    }
    println!("{}", result)
}

fn part_2(input: &Vec<String>) {
    let result = parse_input(input);
    println!("{}", result.len())
}

fn main() {
    let day_name = file!();
    let input = read_day_input(&day_name);
    let example_input = read_day_input_example(&day_name);

    println!("Part 1 - example input");
    part_1(&example_input);

    println!("Part 1 - input");
    part_1(&input);

    // println!("Part 2 - example input");
    // part_2(&example_input);
    //
    // println!("Part 2 - input");
    // part_2(&input);
}

