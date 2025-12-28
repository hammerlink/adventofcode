const EXAMPLE_INPUT: &str = include_str!("./y2025_day10.example");
const INPUT: &str = include_str!("./y2025_day10.input");

mod part1 {
    use std::collections::HashMap;

    pub type Leds = Vec<bool>;
    fn new_leds(input: &str) -> Leds {
        input.chars().map(|v| v == '#').collect()
    }
    fn leds_to_string(leds: &Leds) -> String {
        leds.iter().map(|v| if *v { '#' } else { '.' }).collect()
    }
    fn apply_button(leds: &Leds, button: &[usize]) -> Leds {
        let mut output = leds.clone();
        for b in button {
            output[*b] = !output[*b];
        }
        output
    }

    #[test]
    fn test_parse_machine() {
        let line = "[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}";
        let machine = Machine::new(line);
        assert_eq!(
            machine,
            Machine {
                led_pattern: vec![false, true, true, false],
                buttons: vec![
                    vec![3],
                    vec![1, 3],
                    vec![2],
                    vec![2, 3],
                    vec![0, 2],
                    vec![0, 1]
                ],
                joltage_requirements: vec![3, 5, 4, 7]
            }
        );
        assert_eq!(machine.get_fastest_led_pattern_match(), 2);
    }
    #[derive(Debug, PartialEq)]
    struct Machine {
        led_pattern: Leds,
        buttons: Vec<Vec<usize>>,
        joltage_requirements: Vec<usize>,
    }

    impl Machine {
        fn new(input: &str) -> Self {
            let sanitized_input = input
                .replace("[", "")
                .replace("]", "")
                .replace("{", "")
                .replace("}", "")
                .replace("(", "")
                .replace(")", "");
            let mut parts: Vec<_> = sanitized_input.split(" ").collect();
            let led_pattern: Leds = new_leds(parts.remove(0));
            let joltage_requirements: Vec<usize> = parts
                .pop()
                .unwrap()
                .split(",")
                .map(|v| v.parse().unwrap())
                .collect();
            let buttons: Vec<Vec<usize>> = parts
                .into_iter()
                .map(|part| part.split(",").map(|v| v.parse().unwrap()).collect())
                .collect();
            Machine {
                led_pattern,
                buttons,
                joltage_requirements,
            }
        }

        fn get_fastest_led_pattern_match(&self) -> usize {
            LedsPatternFinder::new(self.led_pattern.clone())
                .get_best_score(&vec![false; self.led_pattern.len()], &self.buttons)
                .unwrap()
        }
    }

    struct LedsPatternFinder {
        pub pattern: String,
        pub best_score_map: HashMap<String, Option<usize>>,
    }

    impl LedsPatternFinder {
        fn new(pattern: Leds) -> Self {
            LedsPatternFinder {
                pattern: leds_to_string(&pattern),
                best_score_map: HashMap::new(),
            }
        }

        fn get_best_score(&mut self, leds: &Leds, buttons: &[Vec<usize>]) -> Option<usize> {
            let leds_key = leds_to_string(leds);
            if leds_key == self.pattern {
                return Some(0);
            }
            // make sure we do not recalculate
            self.best_score_map.insert(leds_key.clone(), None);

            let mut best: Option<usize> = None;

            for button in buttons.iter() {
                let current = apply_button(leds, button);
                let key = leds_to_string(&current);
                if let Some(best_score) = self.best_score_map.get(&key) {
                    if let Some(score) = best_score
                        && (best.is_none() || (*score + 1) < best.unwrap())
                    {
                        best = Some(*score + 1);
                    }

                    continue;
                }
                if let Some(score) = self.get_best_score(&current, buttons) {
                    let score = score + 1;

                    if best.is_none() || score < best.unwrap() {
                        best = Some(score);
                    }
                }
            }

            if best.is_some() {
                self.best_score_map.insert(leds_key.clone(), best);
            }
            best
        }
    }

    #[allow(unused)]
    pub fn execute_part1(input: &str) -> usize {
        // noticed that i can probably enhance performance a lot by using u8 byte values
        let machines = input.lines().map(Machine::new).collect::<Vec<Machine>>();
        machines
            .iter()
            .map(|m| m.get_fastest_led_pattern_match())
            .sum()
    }

    #[allow(unused)]
    pub fn execute_part2(input: &str) -> usize {
        0
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 7);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT);
    println!("{result}");
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
}
#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
}

fn main() {
    // part1::execute_part1(EXAMPLE_INPUT);
    // part1::execute_part1(INPUT);
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("result {}", result);
}
