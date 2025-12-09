const EXAMPLE_INPUT: &str = include_str!("./y2025_day05.example");
const INPUT: &str = include_str!("./y2025_day05.input");

mod part1 {

    use core::fmt;
    use std::fmt::Display;

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

        pub fn get_size(&self) -> u64 {
            self.max - self.min + 1
        }

        pub fn overlaps(&self, other: &Range) -> bool {
            (self.min >= other.min && self.min <= other.max)
                || (other.min >= self.min && other.min <= self.max)
                || (self.max >= other.min && self.max <= other.max)
                || (other.max >= self.min && other.max <= self.max)
        }

        pub fn merge(&mut self, other: &Range) {
            self.min = {
                if self.min < other.min {
                    self.min
                } else {
                    other.min
                }
            };
            self.max = {
                if self.max > other.max {
                    self.max
                } else {
                    other.max
                }
            };
        }
    }

    impl Display for Range {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            write!(f, "{}-{} ", self.min, self.max)
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

    fn get_overlap(ranges: &[Range]) -> Option<(usize, usize)> {
        for (i, r1) in ranges.iter().enumerate() {
            for (j, r2) in ranges.iter().enumerate().skip(i + 1) {
                if r1.overlaps(r2) {
                    return Some((i, j));
                }
            }
        }
        None
    }

    fn merge_ranges(ranges: Vec<Range>) -> Vec<Range> {
        let mut updated_ranges: Vec<Range> = ranges;
        updated_ranges.sort_by_key(|r| r.min);

        while let Some((i, j)) = get_overlap(&updated_ranges) {
            let other = updated_ranges.swap_remove(j);
            updated_ranges.get_mut(i).unwrap().merge(&other);
            updated_ranges.sort_by_key(|r| r.min);
        }

        updated_ranges
    }

    pub fn execute_part2(input: &str) -> u64 {
        let (ranges, _) = parse_input(input);
        let ranges = merge_ranges(ranges);
        // ranges.iter().for_each(|r| {
        //     println!("{}", r);
        // });
        // too high -> not all are merged
        ranges.iter().map(Range::get_size).sum()
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
    assert_eq!(result, 14);
}

#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
    assert!(result < 353244804666944);
}

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
    part1::execute_part2(EXAMPLE_INPUT);
}
