const EXAMPLE_INPUT: &str = include_str!("./y2025_day03.example");
const INPUT: &str = include_str!("./y2025_day03.input");

mod part1 {
    struct BatteryBank {
        values: Vec<u8>,
        current_best: u64,
    }

    impl BatteryBank {
        fn new(line: &str) -> Self {
            let values = line
                .split("")
                .filter(|c| !c.is_empty())
                .map(|c| c.parse().unwrap())
                .collect();
            Self {
                values,
                current_best: 0,
            }
        }
    }

    impl BatteryBank {
        // brute force
        fn calculate_largest_possible_simple_joltage(&self) -> usize {
            let mut highest: u8 = 0;
            for i in 0..self.values.len() - 1 {
                let base = self.values[i] * 10;
                if base + 10 < highest {
                    continue;
                }
                for j in i + 1..self.values.len() {
                    let second_digit = self.values[j];
                    let total = base + second_digit;
                    if total > highest {
                        highest = total;
                    }
                }
            }
            highest.into()
        }

        fn has_enough_values(&self, index: usize, remaining_digits: usize) -> bool {
            index + remaining_digits <= self.values.len()
        }

        fn calculate_best_possible_joltage(
            &mut self,
            start_index: usize,
            remaining_digits: usize,
            current_value: u64,
        ) -> u64 {
            let base_10: u64 = 10u64.pow(remaining_digits as u32 - 1);
            for i in start_index..self.values.len() {
                if remaining_digits <= 1 {
                    let result = current_value + self.values[i] as u64;
                    if result > self.current_best {
                        self.current_best = result;
                    }
                    continue;
                }
                if !self.has_enough_values(i, remaining_digits) {
                    break;
                }
                let new_base = current_value + self.values[i] as u64 * base_10;
                if new_base + base_10 < self.current_best {
                    continue;
                }
                self.calculate_best_possible_joltage(i + 1, remaining_digits - 1, new_base);
            }
            self.current_best
        }
    }

    pub fn execute_part1(input: &str) -> usize {
        let battery_banks: Vec<BatteryBank> = input.lines().map(BatteryBank::new).collect();
        battery_banks
            .iter()
            .map(|x| x.calculate_largest_possible_simple_joltage())
            .sum()
    }

    pub fn execute_part2(input: &str) -> u64 {
        let mut battery_banks: Vec<BatteryBank> = input.lines().map(BatteryBank::new).collect();
        battery_banks
            .iter_mut()
            .map(|x| x.calculate_best_possible_joltage(0, 12, 0))
            .sum()
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 357);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT);
    println!("{result}");
    // assert_eq!(result, 357);
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 3121910778619);
}

#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
    assert_eq!(result, 3121910778619);
}

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
    part1::execute_part2(EXAMPLE_INPUT);
}
