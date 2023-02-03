use std::cell::RefCell;
use std::rc::Rc;

use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};
use aoc_lib::engine::grid_engine::{Grid, GridCell};

struct RopeCell {
    tail_visited: bool,
}

impl Clone for RopeCell {
    fn clone(&self) -> Self {
        RopeCell { tail_visited: self.tail_visited }
    }
}

struct RopeField {
    rope_grid: Grid<RopeCell>,
    head: Position,
    tail: Position,
}

impl RopeField {
    pub fn new() -> Self {
        let mut rope_grid: Grid<RopeCell> = Grid::new(None);
        rope_grid.set_cell_value(0, 0, RopeCell { tail_visited: true, });
        RopeField { 
            rope_grid, 
            head: Position {x: 0, y: 0},
            tail: Position {x: 0, y: 0},
        }
    }

    pub fn print(&self) {
        self.rope_grid.print(|x| {
            if x.is_none() { return String::from("."); }
            match x.unwrap().tail_visited {
                true => "#".to_string(),
                false => ".".to_string(),
            }
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

fn execute_command(line: &String, field: &mut RopeField) {
    let pieces: Vec<&str> = line.split(" ").collect();
    assert!(pieces.len() == 2);
    let direction = pieces.get(0).unwrap().clone();
    let amount = usize::from_str_radix(pieces.get(1).unwrap(), 10).unwrap();
    match direction {
        "U" => { for _ in 0..amount {move_head(field, 0, -1);} },
        "D" => { for _ in 0..amount {move_head(field, 0, 1);} },
        "R" => { for _ in 0..amount {move_head(field, 1, 0);} },
        "L" => { for _ in 0..amount {move_head(field, -1, 0);} },
        _ => {}
    }
    // println!("command {} amount {}", direction, amount);
    // field.print();
}

fn move_head(field: &mut RopeField, x: isize, y: isize) {
    let mut tail_moved = false;
    if y != 0 {
        field.head.y += y;
        let delta: isize = (field.tail.y as isize - field.head.y as isize).abs();
        if delta > 1 { field.tail.y += y; field.tail.x = field.head.x; tail_moved = true; }
    }
    if x != 0 {
        field.head.x += x;
        let delta: isize = (field.tail.x as isize - field.head.x as isize).abs();
        if delta > 1 { field.tail.x += x; field.tail.y = field.head.y; tail_moved = true; }
    }
    if tail_moved {
        field.rope_grid.set_cell_value(field.tail.x, field.tail.y, RopeCell { tail_visited: true });
    }
    
}

struct Position {
    x: isize,
    y: isize,
}

fn parse_input(input: &Vec<String>) -> usize {
    input.len()
}

fn part_1(input: &Vec<String>) {
    let mut field = RopeField::new();
    for line in input.iter() { execute_command(line, &mut field); }
    let result = field.count_tail_fields();
    

    println!("{}", result)
}

fn part_2(input: &Vec<String>) {
    let result = parse_input(input);
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
    part_2(&example_input);

    println!("Part 2 - input");
    part_2(&input);
}

