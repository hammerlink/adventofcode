const EXAMPLE_INPUT: &str = include_str!("./y2025_day05.example");
const INPUT: &str = include_str!("./y2025_day05.input");

mod part1 {
    use regex::Regex;

    struct Ingredient {
        id: u64,
    }

    struct Range {
        min: u64,
        max: u64,
    }

    impl Range {
        pub fn new(line: &str) -> Self {
            let re = Regex::new(r"(\d+)-(\d+)").unwrap();
            let captures = re.captures(line).unwrap();
            Range {
                min: captures[1].parse().unwrap(),
                max: captures[2].parse().unwrap(),
            }
        }
    }

    impl Ingredient {
        pub fn is_in_ranges(&self, ranges: &[Range]) -> bool {
            ranges.iter().any(|r| self.id >= r.min && self.id <= r.max)
        }
    }

    fn parse_input(input: &str) -> (Vec<Range>, Vec<Ingredient>) {
        let mut ranges = vec![];
        let mut ingredients = vec![];

        let mut has_passed_ranges = false;
        input.lines().for_each(|line| {
            if has_passed_ranges {
                return ingredients.push(Ingredient {
                    id: line.parse::<u64>().unwrap(),
                });
            };
            if line.is_empty() {
                has_passed_ranges = true;
                return;
            }
            ranges.push(Range::new(line));
        });

        (ranges, ingredients)
    }

    pub fn execute_part1(input: &str) -> usize {
        let (ranges, ingredients) = parse_input(input);
        ingredients
            .iter()
            .filter(|i| i.is_in_ranges(&ranges))
            .count()
    }

    pub fn execute_part2(input: &str) -> u64 {
        0
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 3);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT);
    println!("{result}");
    assert_eq!(result, 821);
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 43);
}

#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
    assert_eq!(result, 8013);
}

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
    part1::execute_part2(EXAMPLE_INPUT);
}
