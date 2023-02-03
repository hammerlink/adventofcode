use std::borrow::BorrowMut;

use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};
use aoc_lib::engine::grid_engine::Grid;

struct RopeCell {
    tail_visited: bool,
    last_tail_index: usize,
}

impl Clone for RopeCell {
    fn clone(&self) -> Self {
        RopeCell { tail_visited: self.tail_visited, last_tail_index: self.last_tail_index }
    }
}

struct RopeField {
    rope_grid: Grid<RopeCell>,
    knots: Vec<Position>,
}

impl RopeField {
    pub fn new(knot_length: usize) -> Self {
        let mut rope_grid: Grid<RopeCell> = Grid::new(None);
        rope_grid.set_cell_value(0, 0, RopeCell { tail_visited: true, last_tail_index: 0 });
        RopeField {
            rope_grid,
            knots: (0..knot_length).map(|_| Position { x: 0, y: 0 }).collect(),
        }
    }

    pub fn print(&self) {
        self.rope_grid.print(|x| {
            if x.is_none() { return String::from("."); }
            x.unwrap().last_tail_index.to_string()
        })
    }

    pub fn count_tail_fields(&self) -> usize {
        let grid = &self.rope_grid;
        let mut total: usize = 0;
        (grid.min_y..=grid.max_y).for_each(|y| {
            (grid.min_x..=grid.max_x)
                .for_each(|x| {
                    let cell = grid.get_cell_value(x, y);
                    if !cell.is_none() && cell.unwrap().tail_visited {
                        total += 1;
                    }
                })
        });

        total
    }
}

fn execute_command(line: &String, field: &mut RopeField, print: bool) {
    let pieces: Vec<&str> = line.split(" ").collect();
    assert!(pieces.len() == 2);
    let direction = pieces.get(0).unwrap().clone();
    let amount = usize::from_str_radix(pieces.get(1).unwrap(), 10).unwrap();
    match direction {
        "U" => move_knots(field, 0, -1, amount),
        "D" => move_knots(field, 0, 1, amount),
        "R" => move_knots(field, 1, 0, amount),
        "L" => move_knots(field, -1, 0, amount),
        _ => {}
    }
    if print {
        println!("command {} amount {}", direction, amount);
        let mut new_field = RopeField::new(0);
        for (i, x) in field.knots.iter().rev().enumerate() {
            new_field.rope_grid.set_cell_value(x.x, x.y, RopeCell {
                last_tail_index: field.knots.len() - i,
                tail_visited: false,
            });
        }
        new_field.print();
    }
}

fn move_knots(field: &mut RopeField, x: isize, y: isize, amount: usize) {
    (0..amount).for_each(|_| {
        for i in 0..(field.knots.len() - 1) {
            let result = move_knot(field, x, y, i);
            if !result { break; }
        }
    })
}

fn move_knot(field: &mut RopeField, x: isize, y: isize, head_index: usize) -> bool {
    let mut tail_moved = false;
    if y != 0 && head_index == 0 { field.knots[head_index].y += y; }
    if x != 0 && head_index == 0 { field.knots[head_index].x += x; }

    let delta_y: isize = field.knots[head_index + 1].y as isize - field.knots[head_index].y as isize;
    let delta_x: isize = field.knots[head_index + 1].x as isize - field.knots[head_index].x as isize;
    if delta_y.abs() > 1 && delta_x.abs() > 1 {
        field.knots[head_index + 1].y -= &delta_y / &delta_y.abs();
        field.knots[head_index + 1].x -= &delta_x / &delta_x.abs();
        tail_moved = true;
    } else if delta_y.abs() > 1 {
        field.knots[head_index + 1].y -= &delta_y / &delta_y.abs();
        field.knots[head_index + 1].x = field.knots[head_index].x;
        tail_moved = true;
    } else if delta_x.abs() > 1 {
        field.knots[head_index + 1].x -= &delta_x / &delta_x.abs();
        field.knots[head_index + 1].y = field.knots[head_index].y;
        tail_moved = true;
    }

    if tail_moved {
        let tail_x = field.knots[head_index + 1].x;
        let tail_y = field.knots[head_index + 1].y;
        let tail_visited = head_index == field.knots.len() - 2;
        let last_tail_index = head_index + 1;
        let mut current_cell = field.rope_grid
            .get_cell_value(tail_x, tail_y)
            .unwrap_or(RopeCell { tail_visited, last_tail_index });
        current_cell.last_tail_index = last_tail_index;
        if tail_visited && !current_cell.tail_visited { current_cell.tail_visited = true; }

        field.rope_grid.set_cell_value(tail_x, tail_y, current_cell);
    }
    tail_moved
}

struct Position {
    x: isize,
    y: isize,
}

fn part_1(input: &Vec<String>) {
    let mut field = RopeField::new(2);
    for line in input.iter() { execute_command(line, &mut field, false); }
    let result = field.count_tail_fields();


    println!("{}", result)
}

fn part_2(input: &Vec<String>, print: bool) {
    let mut field = RopeField::new(10);
    for line in input.iter() { execute_command(line, &mut field, print); }
    let result = field.count_tail_fields();
    println!("{}", result)
}

fn main() {
    let day_name = file!();
    let input = read_day_input(&day_name);
    let example_input = read_day_input_example(&day_name);

    println!("Part 1 - example input");
    part_1(&example_input);

    println!("Part 1 - input");
    part_1(&input);

    println!("Part 2 - example input");
    part_2(&example_input, true);

    println!("Part 2 - input");
    part_2(&input, false);
}

