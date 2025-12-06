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

    fn has_equal_pieces(s: &str, pieces: usize) -> bool {
        let len = s.len();

        if !len.is_multiple_of(pieces) {
            return false;
        }

        let chunk_size = len / pieces;
        if chunk_size == len {
            return false;
        }

        let chunks: Vec<&[u8]> = s.as_bytes().chunks(chunk_size).collect();
        let first = chunks[0];

        chunks.iter().skip(1).all(|c| *c == first)
    }

    fn is_advanced_invalid_id(id: &str) -> bool {
        let len: usize = id.len();

        let mut pieces = 2;
        loop {
            if len / pieces < 1 {
                return false;
            }

            let is_equal = has_equal_pieces(id, pieces);
            if is_equal {
                return true;
            }

            pieces += 1;
        }
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

        pub fn count_advanced_invalid_ids(&self) -> u64 {
            let mut counter = 0;
            for id in self.min..=self.max {
                // optimalization skip to next valid number
                // uneven count of numbers should jump to even
                let id_str = id.to_string();
                if is_advanced_invalid_id(&id_str) {
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

    pub fn execute_part2(input: &str) -> u64 {
        let ranges: Vec<ProductRange> = input.split(",").map(ProductRange::new).collect();
        ranges
            .iter()
            .map(ProductRange::count_advanced_invalid_ids)
            .sum()
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

#[test]
fn part2_example() {
    let example_input = include_str!("./y2025_day02.example");
    assert_eq!(part1::execute_part2(example_input), 4174379265);
}

#[test]
fn part2_input() {
    let day_input = include_str!("./y2025_day02.input");
    let result = part1::execute_part2(day_input);
    eprintln!("{}", result);
    // assert_eq!(result, 16793817782);
}

fn main() {}
