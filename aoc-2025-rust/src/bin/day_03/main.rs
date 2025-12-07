const EXAMPLE_INPUT: &str = include_str!("./y2025_day03.example");
const INPUT: &str = include_str!("./y2025_day03.input");

mod part1 {
    struct BatteryBank {
        values: Vec<u8>,
    }

    impl BatteryBank {
        fn new(line: &str) -> Self {
            let values = line
                .split("")
                .filter(|c| !c.is_empty())
                .map(|c| c.parse().unwrap())
                .collect();
            Self { values }
        }
    }

    impl BatteryBank {
        // brute force
        fn calculate_largest_possible_joltage(&self) -> usize {
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
    }

    pub fn execute_part1(input: &str) -> usize {
        let battery_banks: Vec<BatteryBank> = input.lines().map(BatteryBank::new).collect();
        battery_banks
            .iter()
            .map(|x| x.calculate_largest_possible_joltage())
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

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
}
