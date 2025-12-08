const EXAMPLE_INPUT: &str = include_str!("./y2025_day04.example");
const INPUT: &str = include_str!("./y2025_day04.input");

mod part1 {
    use std::collections::HashMap;

    #[derive(PartialEq)]
    enum CellType {
        Empty,
        PaperRoll,
    }

    impl CellType {
        pub fn from_char(input: char) -> Self {
            match input {
                '@' => CellType::PaperRoll,
                _ => CellType::Empty,
            }
        }
    }

    struct Cell<V> {
        pub x: i32,
        pub y: i32,
        pub value: V,
    }
    struct Boundaries {
        pub min_x: i32,
        pub max_x: i32,
        pub min_y: i32,
        pub max_y: i32,
    }
    impl Boundaries {
        pub fn new() -> Self {
            Boundaries {
                min_x: 0,
                max_x: 0,
                min_y: 0,
                max_y: 0,
            }
        }
        pub fn update_boundaries(&mut self, x: i32, y: i32) {
            if x > self.max_x {
                self.max_x = x;
            }
            if x < self.min_x {
                self.min_x = x;
            }
            if y > self.max_y {
                self.max_y = y;
            }
            if y < self.min_y {
                self.min_y = y;
            }
        }
    }
    struct Map2d<V> {
        /// [y][x]
        values: HashMap<i32, HashMap<i32, Cell<V>>>,
        boundaries: Boundaries,
    }

    impl<V> Map2d<V> {
        pub fn set_value(&mut self, x: i32, y: i32, v: V) {
            self.boundaries.update_boundaries(x, y);
            self.values
                .entry(y)
                .or_default()
                .insert(x, Cell { x, y, value: v });
        }
        pub fn get_value(&self, x: i32, y: i32) -> &Cell<V> {
            self.values.get(&y).unwrap().get(&x).unwrap()
        }
        pub fn try_get_value(&self, x: i32, y: i32) -> Option<&Cell<V>> {
            if let Some(y_map) = self.values.get(&y) {
                return y_map.get(&x);
            }
            None
        }
        pub fn get_value_mut(&mut self, x: i32, y: i32) -> &mut Cell<V> {
            self.values.get_mut(&y).unwrap().get_mut(&x).unwrap()
        }
        pub fn get_adjacent_values(&self, x: i32, y: i32) -> Vec<&Cell<V>> {
            let mut output = vec![];
            for y_offset in -1..=1 {
                for x_offset in -1..=1 {
                    if x_offset == 0 && y_offset == 0 {
                        continue;
                    }
                    if let Some(cell) = self.try_get_value(x + x_offset, y + y_offset) {
                        output.push(cell);
                    }
                }
            }
            output
        }
        pub fn iter_all(&self) -> impl Iterator<Item = &Cell<V>> {
            let b = &self.boundaries;
            (b.min_y..=b.max_y).flat_map(move |y| {
                (b.min_x..=b.max_x).filter_map(move |x| self.try_get_value(x, y))
            })
        }
    }

    type PaperRollDiagram = Map2d<CellType>;
    impl PaperRollDiagram {
        pub fn new(input: &str) -> Self {
            let mut output = PaperRollDiagram {
                values: HashMap::new(),
                boundaries: Boundaries::new(),
            };

            for (y, line) in input.lines().enumerate() {
                for (x, char) in line.chars().enumerate() {
                    output.set_value(x as i32, y as i32, CellType::from_char(char));
                }
            }
            output
        }
        pub fn count_eligible_paper_rolls(&self) -> usize {
            self.iter_all()
                .filter(|c| {
                    c.value == CellType::PaperRoll
                        && self
                            .get_adjacent_values(c.x, c.y)
                            .iter()
                            .filter(|c| c.value == CellType::PaperRoll)
                            .count()
                            < 4
                })
                .count()
        }
    }

    pub fn execute_part1(input: &str) -> usize {
        PaperRollDiagram::new(input).count_eligible_paper_rolls()
    }

    pub fn execute_part2(input: &str) -> u64 {
        0
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 13);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT);
    println!("{result}");
    // assert_eq!(result, 357);
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 3121910778619);
}

#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
    assert_eq!(result, 3121910778619);
}

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
    part1::execute_part2(EXAMPLE_INPUT);
}
