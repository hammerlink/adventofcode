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
            let mut variant = vec![];
            for line in lines.iter().skip(1) {
                variant.push(line.chars().map(|x| x == '#').collect());
            }
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
    struct PresentArea {}
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

        presents.first().unwrap().print_variants();
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
