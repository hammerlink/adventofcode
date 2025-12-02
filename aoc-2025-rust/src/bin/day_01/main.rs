mod part1 {
    use regex::Regex;

    enum Direction {
        Left,
        Right,
    }

    struct Instruction {
        direction: Direction,
        amount: u16, // 0 - 99
    }

    impl Instruction {
        pub fn new(line: &str) -> Self {
            let re = Regex::new(r"([LR])(\d+)").unwrap();
            let captures = re.captures(line).unwrap();

            let direction = match &captures[1] {
                "L" => Direction::Left,
                "R" => Direction::Right,
                _ => panic!("Invalid direction"),
            };

            let amount = captures[2].parse::<u16>().unwrap();

            Instruction { direction, amount }
        }
    }

    struct PasswordDial {
        position: i32,
        zero_counter: usize,
    }

    impl PasswordDial {
        fn handle_instruction(&mut self, instruction: &Instruction) {
            match instruction.direction {
                Direction::Left => {
                    self.position -= i32::from(instruction.amount);
                }
                Direction::Right => {
                    self.position += i32::from(instruction.amount);
                }
            }
            self.position %= 100;
            if self.position < 0 {
                self.position += 100;
            }

            if self.position == 0 {
                self.zero_counter += 1;
            }
        }
    }

    pub fn execute_part1(input: &str) -> usize {
        let instructions: Vec<Instruction> = input.lines().map(Instruction::new).collect();
        let mut dial = PasswordDial {
            position: 50,
            zero_counter: 0,
        };
        instructions.iter().for_each(|instruction| {
            dial.handle_instruction(instruction);
        });

        println!(
            "output part1: {} - result {}",
            dial.position, dial.zero_counter
        );
        dial.zero_counter
    }
}

#[test]
fn part1_example() {
    let example_input = include_str!("./y2025_day01.example");
    assert_eq!(part1::execute_part1(example_input), 3);
}

#[test]
fn part1_input() {
    let day1_input = include_str!("./y2025_day01.input");
    part1::execute_part1(day1_input);
}

fn main() {}
