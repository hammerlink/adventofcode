const EXAMPLE_INPUT: &str = include_str!("./y2025_day10.example");
const INPUT: &str = include_str!("./y2025_day10.input");

mod part1 {

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
    }
    #[derive(Debug, PartialEq)]
    struct Machine {
        led_pattern: Vec<bool>,
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
            let led_pattern: Vec<bool> = parts.remove(0).chars().map(|v| v == '#').collect();
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
    }

    #[allow(unused)]
    pub fn execute_part1(input: &str) -> usize {
        0
    }

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
    let result = part1::execute_part2(INPUT);
    println!("result {}", result);
}
