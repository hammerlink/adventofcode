mod part1 {
    use regex::Regex;

    #[derive(Clone)]
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
        any_zero_click_counter: u64,
    }

    impl PasswordDial {
        fn handle_instruction(&mut self, instruction: &Instruction, is_final: bool) {
            let mut has_clicked = false;
            let started_at_zero = self.position == 0;
            match instruction.direction {
                Direction::Left => {
                    self.position -= i32::from(instruction.amount);
                }
                Direction::Right => {
                    self.position += i32::from(instruction.amount);
                }
            }
            if self.position >= 100 {
                self.position %= 100;
                self.any_zero_click_counter += 1;
                has_clicked = true;
            }
            if self.position < 0 {
                self.position += 100;
                if !started_at_zero {
                    self.any_zero_click_counter += 1;
                    has_clicked = true;
                }
            }

            if self.position == 0 {
                if !has_clicked {
                    self.any_zero_click_counter += 1;
                }
                if is_final {
                    self.zero_counter += 1;
                }
            }
        }

        fn handle_instruction_listen_click(&mut self, instruction: &Instruction) {
            let batch_size = 99;
            let mut remaining_amount = instruction.amount;
            loop {
                match remaining_amount >= batch_size {
                    true => {
                        remaining_amount -= batch_size;
                        self.handle_instruction(
                            &Instruction {
                                amount: batch_size,
                                direction: instruction.direction.clone(),
                            },
                            false,
                        );
                    }
                    false => {
                        if remaining_amount > 0 {
                            self.handle_instruction(
                                &Instruction {
                                    direction: instruction.direction.clone(),
                                    amount: remaining_amount,
                                },
                                true,
                            );
                        }
                        break;
                    }
                }
            }
        }
    }

    pub fn execute_part1(input: &str) -> usize {
        let instructions: Vec<Instruction> = input.lines().map(Instruction::new).collect();
        let mut dial = PasswordDial {
            position: 50,
            zero_counter: 0,
            any_zero_click_counter: 0,
        };
        instructions.iter().for_each(|instruction| {
            dial.handle_instruction_listen_click(instruction);
        });

        println!(
            "output part1: {} - result {}",
            dial.position, dial.zero_counter
        );
        dial.zero_counter
    }

    pub fn execute_part2(input: &str) -> u64 {
        let instructions: Vec<Instruction> = input.lines().map(Instruction::new).collect();
        let mut dial = PasswordDial {
            position: 50,
            zero_counter: 0,
            any_zero_click_counter: 0,
        };
        instructions.iter().for_each(|instruction| {
            dial.handle_instruction_listen_click(instruction);
        });

        println!(
            "output part2: {} - result {}",
            dial.position, dial.any_zero_click_counter
        );
        dial.any_zero_click_counter
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
    assert_eq!(part1::execute_part1(day1_input), 1023);
}

#[test]
fn part2_example() {
    let example_input = include_str!("./y2025_day01.example");
    assert_eq!(part1::execute_part2(example_input), 6);
}

#[test]
fn part2_input() {
    let day1_input = include_str!("./y2025_day01.input");
    let result = part1::execute_part2(day1_input);
    assert!(result < 6923);
    assert!(result > 5889);
    assert!(result < 5910);
    assert_eq!(result, 5899);
}

fn main() {}
