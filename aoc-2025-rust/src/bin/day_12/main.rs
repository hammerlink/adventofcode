#[allow(unused)]
const EXAMPLE_INPUT: &str = include_str!("./y2025_day12.example");
const INPUT: &str = include_str!("./y2025_day12.input");

mod part1 {
    // each gift can be rotated and flipped in every direction
    // => 8 versions of each gift
    // each gift is 3x3
    // keep track of best score
    // get an optimistic score?
    // 2d array

    trait Plane<T> {
        fn print(&self);
        fn is_equal(&self, other: &T) -> bool;
        fn rotate_right(&self) -> Self;
        fn flip_x(&self) -> Self;
        fn flip_y(&self) -> Self;
    }

    impl Plane<Vec<Vec<bool>>> for Vec<Vec<bool>> {
        fn print(&self) {
            for line in self.iter() {
                let line: String = line.iter().map(|x| if *x { '#' } else { '.' }).collect();
                println!("{line}");
            }
        }

        fn is_equal(&self, other: &Vec<Vec<bool>>) -> bool {
            for (y, line) in self.iter().enumerate() {
                for (x, value) in line.iter().enumerate() {
                    if *value != other[y][x] {
                        return false;
                    }
                }
            }
            true
        }

        fn rotate_right(&self) -> Self {
            let mut output = vec![];
            let len_x = self.first().unwrap().len();
            for x in 0..len_x {
                let mut line: Vec<bool> = vec![];
                for y in 0..self.len() {
                    line.push(self[y][x]);
                }
                output.push(line);
            }

            output
        }

        fn flip_x(&self) -> Self {
            let mut output = self.clone();
            for line in output.iter_mut() {
                line.reverse();
            }
            output
        }

        fn flip_y(&self) -> Self {
            let mut output = self.clone();
            output.reverse();
            output
        }
    }

    struct Present {
        id: usize,
        /// all rotated and flipped versions
        /// Variants < Y-axis < X-axis > > >
        variants: Vec<Vec<Vec<bool>>>,
    }
    impl Present {
        fn new(lines: &[&str]) -> Self {
            assert!(lines.len() == 4);
            let id: usize = lines[0].split_once(":").unwrap().0.parse().unwrap();
            let mut variants = vec![];
            let mut variant: Vec<Vec<bool>> = vec![];
            for line in lines.iter().skip(1) {
                variant.push(line.chars().map(|x| x == '#').collect());
            }

            assert_eq!(variant.len(), 3);
            assert_eq!(variant[0].len(), 3);

            fn push(variant: Vec<Vec<bool>>, variants: &mut Vec<Vec<Vec<bool>>>) {
                if !variants.iter().any(|x| x.is_equal(&variant)) {
                    variants.push(variant);
                }
            }
            // build all variants
            push(variant.clone(), &mut variants);
            push(variant.flip_x(), &mut variants);
            push(variant.flip_x().flip_y(), &mut variants);
            push(variant.flip_y(), &mut variants);
            variant = variant.rotate_right();
            push(variant.clone(), &mut variants);
            push(variant.flip_y(), &mut variants);
            variant = variant.flip_x();
            push(variant.clone(), &mut variants);
            push(variant.flip_y(), &mut variants);

            Present { id, variants }
        }

        fn print_variants(&self) {
            println!("present id: {}", self.id);
            for (i, variant) in self.variants.iter().enumerate() {
                println!("variant: {}", i);
                variant.print();
                println!();
            }
        }
    }
    struct Position {
        x: i32,
        y: i32,
    }
    impl Position {
        fn apply_relative_position(&self, x: usize, y: usize) -> Position {
            Position {
                x: self.x + x as i32,
                y: self.y + y as i32,
            }
        }
    }
    struct PresentArea {
        y_width: usize,
        x_length: usize,
        /// the index is equal to the present id
        required_presents: Vec<usize>,
        /// Y-axis < X-axis >
        area: Vec<Vec<bool>>,
    }
    impl PresentArea {
        fn new(line: &str) -> Self {
            let (dimension_str, present_str) = line.split_once(": ").expect("is valid dimension");
            let (y_str, x_str) = dimension_str.split_once("x").expect("valid dimension part");
            let y_width = y_str.parse().expect("valid y");
            let x_length = x_str.parse().expect("valid x");
            PresentArea {
                y_width,
                x_length,
                required_presents: present_str
                    .split(" ")
                    .map(|x| x.parse().expect("valid required present"))
                    .collect(),
                area: vec![vec![false; x_length]; y_width],
            }
        }

        fn get_value(&self, p: &Position) -> Option<bool> {
            if p.x < 0 || p.y < 0 || p.x >= self.x_length as i32 || p.y >= self.y_width as i32 {
                return None;
            }
            Some(self.area[p.y as usize][p.x as usize])
        }

        /// position is in top left
        fn try_place_present(&mut self, p: &Position, present_variant: &[Vec<bool>]) -> bool {
            let mut to_update: Vec<(usize, usize)> = vec![];
            for y in 0..3 {
                for x in 0..3 {
                    if present_variant[y][x]
                        && let position = p.apply_relative_position(x, y)
                        && let Some(cell_value) = self.get_value(&position)
                    {
                        if cell_value {
                            return false;
                        } else {
                            to_update.push((position.x as usize, position.y as usize));
                        }
                    }
                }
            }
            to_update.iter().for_each(|(x, y)| self.area[*y][*x] = true);

            true
        }
        /// position is in top left
        fn remove_present(&mut self, p: &Position, present_variant: &[Vec<bool>]) {
            for y in 0..3 {
                for x in 0..3 {
                    if present_variant[y][x]
                        && let position = p.apply_relative_position(x, y)
                        && let Some(_) = self.get_value(&position)
                    {
                        self.area[position.y as usize][position.x as usize] = false;
                    }
                }
            }
        }
    }

    pub fn execute_part1(input: &str) -> usize {
        let mut presents: Vec<Present> = vec![];
        let mut cached_lines: Vec<&str> = vec![];
        for line in input.lines() {
            if line.is_empty() {
                if !cached_lines.is_empty() {
                    presents.push(Present::new(&cached_lines));
                }
                cached_lines = vec![];
            } else {
                cached_lines.push(line);
            }
        }
        let present_areas = cached_lines
            .into_iter()
            .map(PresentArea::new)
            .collect::<Vec<_>>();
        assert_eq!(presents.first().unwrap().variants.len(), 8);

        // try fill from top left to bottom right
        // fill as close as possible to the last placed piece
        // try all pieces as a first, try as much out of scope as possible
        // everything is 3x3
        // start on last placed location
        // move 3 down
        // move 1 to the right, and attempt 3 down each time
        // in theory it should work each time
        // do this for every available piece
        0
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
    assert_eq!(result, 2);
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
    let result = part1::execute_part2(INPUT);
    println!("result {}", result);
}
