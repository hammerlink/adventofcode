#[allow(unused)]
const EXAMPLE_INPUT: &str = include_str!("./y2025_day12.example");
const INPUT: &str = include_str!("./y2025_day12.input");

mod part1 {
    use std::cell::RefCell;

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
                (0..self.len()).for_each(|y| {
                    line.push(self[y][x]);
                });
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
        required_cells: usize,
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
            let mut required_cells = 0_usize;
            variant.iter().for_each(|y| {
                y.iter().for_each(|v| {
                    if *v {
                        required_cells += 1;
                    }
                })
            });

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

            Present {
                id,
                variants,
                required_cells,
            }
        }

        #[allow(unused)]
        fn print_variants(&self) {
            println!("present id: {}", self.id);
            for (i, variant) in self.variants.iter().enumerate() {
                println!("variant: {}", i);
                variant.print();
                println!();
            }
        }
    }
    #[derive(Debug, Clone)]
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
        fn next(&self, present_area: &PresentArea) -> Option<Position> {
            let mut next_x = self.x;
            let mut next_y = self.y;
            next_x += 1;
            if next_x > present_area.x_length as i32 - 2 {
                next_x = -1;
                next_y += 1;
                if next_y > present_area.y_width as i32 - 2 {
                    return None;
                }
            }

            Some(Position {
                x: next_x,
                y: next_y,
            })
        }
    }

    struct PresentPlacement {
        present_index: usize,
        variant_index: usize,
        top_left: Position,
    }

    struct PresentArea {
        y_width: usize,
        x_length: usize,
        total_cell_count: usize,
        /// the index is equal to the present id
        // required_presents: Vec<usize>,
        remaining_presents: RefCell<Vec<usize>>,
        placed_presents: RefCell<Vec<PresentPlacement>>,
        /// Y-axis < X-axis >
        area: RefCell<Vec<Vec<bool>>>,
    }
    impl PresentArea {
        fn new(line: &str) -> Self {
            let (dimension_str, present_str) = line.split_once(": ").expect("is valid dimension");
            let (y_str, x_str) = dimension_str.split_once("x").expect("valid dimension part");
            let y_width = y_str.parse().expect("valid y");
            let x_length = x_str.parse().expect("valid x");
            let required_presents: Vec<usize> = present_str
                .split(" ")
                .map(|x| x.parse().expect("valid required present"))
                .collect();
            PresentArea {
                total_cell_count: x_length * y_width,
                y_width,
                x_length,
                remaining_presents: required_presents.clone().into(),
                // required_presents,
                area: vec![vec![false; x_length]; y_width].into(),
                placed_presents: vec![].into(),
            }
        }

        fn get_value(&self, p: &Position) -> Option<bool> {
            if p.x < 0 || p.y < 0 || p.x >= self.x_length as i32 || p.y >= self.y_width as i32 {
                return None;
            }
            Some(self.area.borrow()[p.y as usize][p.x as usize])
        }

        /// position is in top left, also updates the placed presents
        fn try_place_present(
            &self,
            p: &Position,
            present_variant: &[Vec<bool>],
            present_index: usize,
            variant_index: usize,
        ) -> bool {
            let mut to_update: Vec<(usize, usize)> = vec![];
            for y in 0..3 {
                for x in 0..3 {
                    if present_variant[y][x] {
                        let position = p.apply_relative_position(x, y);
                        let cell_value = self.get_value(&position);
                        if cell_value.is_none() || cell_value.unwrap() {
                            return false;
                        }
                        to_update.push((position.x as usize, position.y as usize));
                    }
                }
            }
            // It is possible to place the present
            to_update
                .iter()
                .for_each(|(x, y)| self.area.borrow_mut()[*y][*x] = true);
            self.placed_presents.borrow_mut().push(PresentPlacement {
                present_index,
                variant_index,
                top_left: p.clone(),
            });
            let updated_remaining = self.remaining_presents.borrow()[present_index] - 1;
            self.remaining_presents.borrow_mut()[present_index] = updated_remaining;

            true
        }

        fn try_fill_position(
            &self,
            presents: &[Present],
            popped_placement: &Option<PresentPlacement>,
            position: &Position,
        ) {
            let present_index_offset: i32 = {
                if let Some(placement) = &popped_placement {
                    placement.present_index as i32
                } else {
                    -1
                }
            };
            let mut variant_index_offset: i32 = {
                if let Some(placement) = &popped_placement {
                    placement.variant_index as i32
                } else {
                    -1
                }
            };
            for (present_index, present) in presents
                .iter()
                .enumerate()
                .skip((present_index_offset + 1) as usize)
            {
                let remaining_count = self.remaining_presents.borrow()[present_index];
                if remaining_count == 0 {
                    continue;
                }

                for (variant_index, variant) in present
                    .variants
                    .iter()
                    .enumerate()
                    .skip((variant_index_offset + 1) as usize)
                {
                    if self.try_place_present(position, variant, present_index, variant_index) {
                        // println!(
                        //     "PLACED present {:?} - {} - {}",
                        //     position, present_index, variant_index
                        // );
                        // variant.print();
                        // println!("------");
                        // self.print();
                        // println!("------");
                        return;
                    }
                }
                variant_index_offset = 0;
            }
        }
        fn pop_last_placement(&self, presents: &[Present]) -> Option<PresentPlacement> {
            if let Some(placement) = self.placed_presents.borrow_mut().pop() {
                self.remove_present(
                    &placement.top_left,
                    &presents[placement.present_index].variants[placement.variant_index],
                );
                let updated_remaining =
                    self.remaining_presents.borrow()[placement.present_index] + 1;
                self.remaining_presents.borrow_mut()[placement.present_index] = updated_remaining;
                Some(placement)
            } else {
                None
            }
        }
        /// position is in top left
        fn remove_present(&self, p: &Position, present_variant: &[Vec<bool>]) {
            (0..3).for_each(|y| {
                (0..3).for_each(|x| {
                    if present_variant[y][x]
                        && let position = p.apply_relative_position(x, y)
                        && let Some(_) = self.get_value(&position)
                    {
                        self.area.borrow_mut()[position.y as usize][position.x as usize] = false;
                    }
                });
            });
        }

        fn has_remaining_presents(&self) -> bool {
            self.remaining_presents.borrow().iter().any(|v| *v > 0)
        }

        fn can_fill_remaining_presents(&self, presents: &[Present]) -> bool {
            let remaining_presents = self.remaining_presents.borrow();
            let required_cells: usize = presents
                .iter()
                .enumerate()
                .map(|(present_index, present)| {
                    remaining_presents[present_index] * present.required_cells
                })
                .sum();
            required_cells <= self.total_cell_count
        }

        #[allow(unused)]
        fn print(&self) {
            for area_line in self.area.borrow().iter() {
                let mut line: String = "".to_string();
                for v in area_line.iter() {
                    let char = if *v { '#' } else { '.' };
                    line = format!("{line}{char}");
                }
                println!("{line}");
            }
        }
    }

    fn can_place_all_presents(present_area: &PresentArea, presents: &[Present]) -> bool {
        let mut current_position = Some(Position { x: -1, y: -1 });
        let mut popped_placement: Option<PresentPlacement>;

        while current_position.is_some() {
            let mut position = current_position.clone().unwrap();
            if !present_area.has_remaining_presents() {
                return true;
            }
            popped_placement = None;

            if !present_area.can_fill_remaining_presents(presents) {
                // TODO optimize, calculate
                // based on the current position
                if let Some(popped) = present_area.pop_last_placement(presents) {
                    position = popped.top_left.clone();
                    popped_placement = Some(popped);
                }
            }

            present_area.try_fill_position(presents, &popped_placement, &position);
            current_position = position.next(present_area);
        }

        false
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
        cached_lines
            .into_iter()
            .map(PresentArea::new)
            .filter(|x| can_place_all_presents(x, &presents))
            .count()
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

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
}
