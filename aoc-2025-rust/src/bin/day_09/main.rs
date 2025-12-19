const EXAMPLE_INPUT: &str = include_str!("./y2025_day09.example");
const INPUT: &str = include_str!("./y2025_day09.input");

mod part1 {
    #[derive(Debug, Clone)]
    pub struct Position {
        pub x: usize,
        pub y: usize,
    }

    impl Position {
        pub fn new(line: &str) -> Self {
            let pieces: Vec<&str> = line.split(",").collect();
            Position {
                x: pieces.first().unwrap().parse().unwrap(),
                y: pieces.get(1).unwrap().parse().unwrap(),
            }
        }
        pub fn calculate_size(&self, other: &Position) -> usize {
            let x_size = std::cmp::max(self.x, other.x) - std::cmp::min(self.x, other.x) + 1;
            let y_size = std::cmp::max(self.y, other.y) - std::cmp::min(self.y, other.y) + 1;

            x_size * y_size
        }
        fn origin_distance(&self) -> f64 {
            let dx = self.x as f64 - 0_f64;
            let dy = self.y as f64 - 0_f64;
            (dx * dx + dy * dy).sqrt()
        }
    }
    #[test]
    fn test_caluculate_size() {
        let a = Position::new("2,5");
        let b = Position::new("9,7");
        assert_eq!(a.calculate_size(&b), 24);
    }

    pub fn execute_part1(input: &str) -> usize {
        let mut positions: Vec<Position> = input.lines().map(Position::new).collect();
        positions.sort_by(|a, b| a.origin_distance().total_cmp(&b.origin_distance()));
        let start = positions.first().unwrap();
        let end = positions.last().unwrap();
        start.calculate_size(end)
    }

    pub fn execute_part2(_input: &str) -> usize {
        0
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 50);
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
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
    part1::execute_part2(EXAMPLE_INPUT);
}
