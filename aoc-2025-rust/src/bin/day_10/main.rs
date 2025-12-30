#[allow(unused)]
const EXAMPLE_INPUT: &str = include_str!("./y2025_day10.example");
const INPUT: &str = include_str!("./y2025_day10.input");

mod part1 {
    use rayon::prelude::*;
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
        let mut machine = Machine::new(line);
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
        assert_eq!(machine.get_fastest_configuration(), 10);
    }
    #[test]
    fn test_logic() {
        let line = "[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}";
        let mut machine = Machine::new(line);
        assert_eq!(machine.get_fastest_configuration(), 12);
    }

    #[test]
    fn test_heavy_load() {
        let line = "[.####..#] (0,1,7) (0,2,4,5,6,7) (2,3) (1,2,6) (1,2,5,7) (3,4,6,7) (2,7) (2,3,4,6,7) {10,187,228,38,28,192,33,218}";
        let mut machine = Machine::new(line);
        assert_eq!(machine.get_fastest_configuration(), 243);
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

        fn get_fastest_configuration(&mut self) -> usize {
            use std::sync::atomic::{AtomicUsize, Ordering};

            static COUNTER: AtomicUsize = AtomicUsize::new(0);
            let current_count = COUNTER.fetch_add(1, Ordering::Relaxed);

            println!("starting new check #{}", current_count);
            self.buttons.sort_by(|a, b| {
                // First, sort by length (largest first)
                let len_cmp = b.len().cmp(&a.len());
                if len_cmp != std::cmp::Ordering::Equal {
                    return len_cmp;
                }

                // If lengths are equal, sort by sum of joltage values (highest first)
                let a_joltage_sum: usize = a
                    .iter()
                    .map(|&idx| self.joltage_requirements[idx])
                    .max()
                    .unwrap_or(0);
                let b_joltage_sum: usize = b
                    .iter()
                    .map(|&idx| self.joltage_requirements[idx])
                    .max()
                    .unwrap_or(0);
                b_joltage_sum.cmp(&a_joltage_sum)
            });
            let result = JoltageFinder::new(MachineSettings {
                joltages: self.joltage_requirements.clone(),
            })
            .get_best_score(
                MachineSettings {
                    joltages: vec![0; self.joltage_requirements.len()],
                },
                self.buttons.iter().map(|b| Button::new(b)).collect(),
                0,
            )
            .unwrap();
            println!("finished #{} with {}", current_count, result);
            result
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

    #[derive(Debug, Clone)]
    struct Button {
        indices: Vec<usize>,
        maximum: usize,
        total_maximum: usize,
        is_required: bool,
    }
    impl PartialEq for Button {
        fn eq(&self, other: &Button) -> bool {
            self.indices == other.indices
        }
    }
    impl Button {
        fn new(button: &[usize]) -> Self {
            Button {
                indices: button.to_vec(),
                maximum: 0,       // minimum can be applied
                total_maximum: 0, // total needed joltage
                is_required: false,
            }
        }

        fn update_max(&mut self, required_joltages: &[usize]) {
            self.maximum = self
                .indices
                .iter()
                .map(|index| required_joltages[*index])
                .min()
                .unwrap_or(0);
            self.total_maximum = self.maximum;
        }
    }

    fn apply_required_buttons(required_joltages: &[usize], buttons: &[Button]) -> Vec<usize> {
        let mut output = required_joltages.to_vec();

        buttons.iter().for_each(|button| {
            if !button.is_required {
                return;
            }
            button.indices.iter().for_each(|i| {
                output[*i] = output[*i].saturating_sub(button.maximum);
            });
        });

        output
    }

    #[derive(Debug, Clone, PartialEq)]
    struct MachineSettings {
        joltages: Vec<usize>,
    }

    impl MachineSettings {
        fn get_max_steps(&self) -> usize {
            self.joltages.iter().sum()
        }

        fn push_button(&self, button: &Button, joltages: &[usize], amount: usize) -> Option<Self> {
            let mut output = self.clone();

            for b in button.indices.iter() {
                output.joltages[*b] += amount;
                if output.joltages[*b] > joltages[*b] {
                    return None;
                }
            }

            Some(output)
        }

        fn is_equal(&self, other: &MachineSettings) -> bool {
            self.joltages == other.joltages
        }
    }

    fn get_updated_buttons(buttons: &[Button], required_joltages: &[usize]) -> Vec<Button> {
        let mut buttons = buttons.to_vec();
        buttons
            .iter_mut()
            .for_each(|x| x.update_max(required_joltages));

        let mut first = false;
        while !first || buttons.iter().any(|x| x.maximum == 0) {
            first = true;
            buttons.retain(|x| x.maximum > 0);

            let buttons_per_joltage: Vec<usize> = required_joltages
                .iter()
                .enumerate()
                .map(|(i, _)| {
                    buttons
                        .iter()
                        .filter(|button| button.indices.contains(&i))
                        .count()
                })
                .collect();
            buttons_per_joltage
                .iter()
                .enumerate()
                .for_each(|(i, amount)| {
                    if *amount == 1 {
                        buttons.iter_mut().for_each(|button| {
                            if button.indices.contains(&i) {
                                button.is_required = true;
                            }
                        });
                    }
                });

            let required_joltages = apply_required_buttons(required_joltages, &buttons);
            buttons.iter_mut().for_each(|x| {
                if !x.is_required {
                    x.update_max(&required_joltages);
                }
            });
        }

        buttons
    }

    fn can_be_fixed(buttons: &[Button], required_joltages: &[usize]) -> bool {
        required_joltages.iter().enumerate().all(|(i, amount)| {
            if *amount == 0 {
                return true;
            }

            buttons.iter().any(|b| b.indices.contains(&i))
        })
    }

    fn calculate_optimistic_required_steps(
        buttons: &[Button],
        required_joltages: &[usize],
    ) -> usize {
        let mut remaining_joltages = required_joltages.to_vec();
        let mut total_steps = 0;

        while remaining_joltages.iter().any(|&x| x > 0) {
            let min_joltage_index = remaining_joltages
                .iter()
                .enumerate()
                .filter(|(_, v)| **v > 0)
                .min_by_key(|(_, v)| **v)
                .map(|(i, _)| i)
                .unwrap();
            let amount = remaining_joltages[min_joltage_index];
            let mut related_indices: Vec<usize> = vec![min_joltage_index];
            buttons.iter().for_each(|button| {
                if button.indices.contains(&min_joltage_index) {
                    button.indices.iter().for_each(|i| {
                        if !related_indices.contains(i) {
                            related_indices.push(*i);
                        }
                    });
                }
            });
            for i in related_indices {
                remaining_joltages[i] = remaining_joltages[i].saturating_sub(amount);
            }
            total_steps += amount;
        }

        total_steps
    }

    struct JoltageFinder {
        current_best: Option<usize>,
        required_settings: MachineSettings,
        max_steps: usize,
    }

    impl JoltageFinder {
        fn new(required_settings: MachineSettings) -> Self {
            JoltageFinder {
                current_best: None,
                max_steps: required_settings.get_max_steps(),
                required_settings,
            }
        }

        fn try_set_best_score(&mut self, score: usize) -> bool {
            if self.current_best.is_none() || self.current_best.unwrap() > score {
                self.current_best = Some(score);
                println!("set best: {}", score);
                return true;
            }
            false
        }

        fn get_current_required_joltages(&self, settings: &MachineSettings) -> Vec<usize> {
            self.required_settings
                .joltages
                .iter()
                .enumerate()
                .map(|(i, total_needed)| total_needed.saturating_sub(settings.joltages[i]))
                .collect()
        }

        fn get_best_score(
            &mut self,
            settings: MachineSettings,
            buttons: Vec<Button>,
            step: usize,
        ) -> Option<usize> {
            if settings.is_equal(&self.required_settings) {
                self.try_set_best_score(step);
                return Some(step);
            }

            // check if we can still continue
            if step >= self.max_steps
                || (self.current_best.is_some() && step >= self.current_best.unwrap())
            {
                return None;
            }
            let required_joltages = self.get_current_required_joltages(&settings);
            let mut buttons = get_updated_buttons(&buttons, &required_joltages);

            if !can_be_fixed(&buttons, &required_joltages) {
                return None;
            }

            if let Some(button) = buttons.iter().find(|x| x.is_required && x.maximum > 0)
                && let Some(new_settings) =
                    settings.push_button(button, &self.required_settings.joltages, button.maximum)
            {
                let mut buttons = buttons.clone();
                buttons.retain(|x| x.indices != button.indices);
                self.get_best_score(new_settings, buttons, step + button.maximum);

                return self.current_best;
            }
            buttons.sort_by_key(|x| x.maximum);

            for i in 0..buttons.len() {
                let max = buttons[i].maximum;
                for steps in 0..max {
                    let steps = max - steps;
                    if let Some(new_settings) =
                        settings.push_button(&buttons[i], &self.required_settings.joltages, steps)
                    {
                        self.get_best_score(new_settings, buttons[i + 1..].to_vec(), step + steps);
                    }
                }
            }
            self.current_best
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
        // TODO iterate ordered,

        // max joltage = 1754
        // average 404
        input
            .lines()
            .par_bridge()
            .map(|line| Machine::new(line).get_fastest_configuration())
            .sum()
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
    assert_eq!(result, 33);
}
#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
}

fn main() {
    // part1::execute_part1(EXAMPLE_INPUT);
    // part1::execute_part1(INPUT);
    let result = part1::execute_part2(INPUT);
    println!("result {}", result);
}
