const EXAMPLE_INPUT: &str = include_str!("./y2025_day07.example");
const INPUT: &str = include_str!("./y2025_day07.input");

mod part1 {
    use aoc_2025_rust::map::{Map2d, Position};

    #[derive(PartialEq)]
    pub enum Tachyon {
        Start,
        Empty,
        Splitter,
        Beam,
    }

    struct Value {
        v_type: Tachyon,
        has_split: bool,
    }

    impl Tachyon {
        fn new(c: &char) -> Self {
            match c {
                'S' => Tachyon::Start,
                '.' => Tachyon::Empty,
                '^' => Tachyon::Splitter,
                _ => panic!("unknown char"),
            }
        }
        fn to_string(&self) -> char {
            match self {
                Tachyon::Start => 'S',
                Tachyon::Empty => '.',
                Tachyon::Splitter => '^',
                Tachyon::Beam => '|',
            }
        }
    }

    struct TachyonMap {
        map: Map2d<Value>,
        start_x: i32,
        start_y: i32,
        split_counter: usize,
    }

    impl TachyonMap {
        fn cast_ray(&mut self, start: Position) -> bool {
            if !self.map.has_value(start.x, start.y) {
                return false;
            }
            {
                let current = self.map.get_value_mut(start.x, start.y);
                if current.value.v_type == Tachyon::Beam {
                    return false;
                }
                if current.value.v_type != Tachyon::Start {
                    current.value.v_type = Tachyon::Beam;
                }
            }

            let x = start.x;
            let mut y = start.y + 1;
            let mut next = self.map.try_get_value(x, y);
            while let Some(cell) = next {
                if cell.value.v_type == Tachyon::Splitter {
                    if cell.value.has_split {
                        return false;
                    }
                    self.map.get_value_mut(x, y).value.has_split = true;
                    self.split_counter += 1;
                    self.cast_ray(Position { x: x - 1, y });
                    self.cast_ray(Position { x: x + 1, y });
                    break;
                } else if cell.value.v_type == Tachyon::Empty {
                    self.map.get_value_mut(x, y).value.v_type = Tachyon::Beam;
                }
                y += 1;
                next = self.map.try_get_value(x, y);
            }
            true
        }

        fn print(&self) {
            for y in self.map.boundaries.min_y..=self.map.boundaries.max_y {
                let mut line: String = "".to_string();
                for x in self.map.boundaries.min_x..=self.map.boundaries.max_x {
                    line = format!(
                        "{} {}",
                        line,
                        self.map.get_value(x, y).value.v_type.to_string()
                    );
                }
                println!("{line}");
            }
        }
    }

    fn parse_input(input: &str) -> TachyonMap {
        let mut tachon_map: TachyonMap = TachyonMap {
            map: Map2d::new(),
            start_x: 0,
            start_y: 0,
            split_counter: 0,
        };
        for (y, line) in input.lines().enumerate() {
            for (x, c) in line.chars().enumerate() {
                let tachyon = Tachyon::new(&c);
                if tachyon == Tachyon::Start {
                    tachon_map.start_x = x as i32;
                    tachon_map.start_y = y as i32;
                }
                tachon_map.map.set_value(
                    x as i32,
                    y as i32,
                    Value {
                        v_type: tachyon,
                        has_split: false,
                    },
                );
            }
        }
        tachon_map
    }

    pub fn execute_part1(input: &str) -> usize {
        let mut map = parse_input(input);
        map.cast_ray(Position {
            x: map.start_x,
            y: map.start_y,
        });
        // map.print();

        map.split_counter
    }

    pub fn execute_part2(_input: &str) -> u64 {
        0
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 21);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT);
    println!("{result}");
    assert!(result < 1831);
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
}
#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
}

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
    part1::execute_part2(EXAMPLE_INPUT);
}
