mod part1 {
    use regex::Regex;

    struct ProductRange {
        min: usize,
        max: usize,
    }

    fn is_invalid_id(id: &str) -> bool {
        let (left, right) = id.split_at(id.len() / 2);
        left == right
    }

    impl ProductRange {
        pub fn new(line: &str) -> Self {
            let re = Regex::new(r"(\d+)-(\d+)").unwrap();
            let captures = re.captures(line).unwrap();
            ProductRange {
                min: captures[1].parse().unwrap(),
                max: captures[2].parse().unwrap(),
            }
        }

        pub fn count_invalid_ids(&self) -> u64 {
            let mut counter = 0;
            for id in self.min..=self.max {
                // optimalization skip to next valid number
                // uneven count of numbers should jump to even
                let id_str = id.to_string();
                let digits = id_str.len();
                if digits % 2 > 0 {
                    continue;
                }
                if is_invalid_id(&id_str) {
                    counter += id as u64;
                }
            }
            counter
        }
    }

    pub fn execute_part1(input: &str) -> u64 {
        let ranges: Vec<ProductRange> = input.split(",").map(ProductRange::new).collect();
        ranges.iter().map(ProductRange::count_invalid_ids).sum()
    }
}

#[test]
fn part1_example() {
    let example_input = include_str!("./y2025_day02.example");
    assert_eq!(part1::execute_part1(example_input), 1227775554);
}

#[test]
fn part1_input() {
    let day_input = include_str!("./y2025_day02.input");
    let result = part1::execute_part1(day_input);
    eprintln!("{}", result);
    assert_eq!(result, 16793817782);
}

fn main() {}
