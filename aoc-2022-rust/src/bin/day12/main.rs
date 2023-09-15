use aoc_lib::engine::{
    grid_engine::{Grid, Location, BASIC_DIRECTIONS},
    util_engine::print_fixed_length_number,
};

struct HillLocation {
    pub raw_char: char,
    pub height: i32,
    last_visited: Option<i32>,
    last_visualization: Option<char>,
    best_last_visited: Option<i32>,
    best_last_visualization: Option<char>,
}
impl Clone for HillLocation {
    fn clone(&self) -> Self {
        HillLocation {
            raw_char: self.raw_char,
            height: self.height,
            last_visited: self.last_visited,
            last_visualization: self.last_visualization,
            best_last_visited: self.best_last_visited,
            best_last_visualization: self.best_last_visualization,
        }
    }
}

impl HillLocation {
    pub fn new(raw_char: char) -> Self {
        HillLocation {
            raw_char,
            height: get_hill_height(raw_char),
            last_visited: None,
            last_visualization: None,
            best_last_visited: None,
            best_last_visualization: None,
        }
    }

    pub fn can_move_to_reverse(&self, other: HillLocation, step_count: i32) -> bool {
        if !self.last_visited.is_none() {
            return false;
        }
        if !self.best_last_visited.is_none() && self.best_last_visited.unwrap() < step_count {
            return false;
        }
        self.height + 1 >= other.height
    }
}

struct HillField {
    grid: Grid<HillLocation>,
    start: Location,
    end: Location,
}
impl HillField {
    pub fn new(input: &str) -> Self {
        let mut grid: Grid<HillLocation> = Grid::new(None);
        let mut start: Option<Location> = None;
        let mut end: Option<Location> = None;
        let lines = input.lines();
        for (y, line) in lines.into_iter().enumerate() {
            for (x, char) in line.chars().into_iter().enumerate() {
                grid.set_cell_value(x as isize, y as isize, HillLocation::new(char));
                if char == 'S' {
                    start = Some(Location {
                        x: x as isize,
                        y: y as isize,
                    })
                }
                if char == 'E' {
                    end = Some(Location {
                        x: x as isize,
                        y: y as isize,
                    })
                }
            }
        }
        let current = start.unwrap();
        HillField {
            grid,
            start: current.clone(),
            end: end.unwrap(),
        }
    }

    pub fn calculate_fastest_path(&mut self) -> usize {
        let least_steps: Option<usize> = None;

        move_to_start(&mut self.grid, self.end.clone(), 0);

        if least_steps.is_none() {
            return 0;
        }
        least_steps.unwrap()
    }
}

fn store_best_last_visited(grid: &mut Grid<HillLocation>) {
    grid.iterate_mut(|c| {
        if c.is_none() {
            return None;
        }
        let mut cell = c.unwrap();
        if !cell.last_visited.is_none() {
            cell.best_last_visualization = cell.last_visualization;
            let last_visited = cell.last_visited.unwrap();
            if cell.best_last_visited.is_none() || cell.best_last_visited.unwrap() > last_visited {
                cell.best_last_visited = Some(last_visited);
            }
        } else {
            cell.best_last_visualization = None;
        }
        Some(cell)
    })
}
fn print_field(grid: &Grid<HillLocation>) {
    grid.print(|location| {
        if location.is_none() {
            return String::from(".");
        }
        let f = location.unwrap();
        let mut visual = '.';
        if !f.last_visualization.is_none() {
            visual = f.last_visualization.unwrap();
        }
        if f.raw_char == 'E' {
            visual = 'E';
        }
        if f.raw_char == 'S' {
            visual = 'S';
        }
        return format!("{}", visual).to_string();
    })
}

static mut BEST_SCORE: i32 = -1;
fn move_to_start(
    grid: &mut Grid<HillLocation>,
    location: Location,
    step_count: i32,
) -> Option<i32> {
    // println!("x: {} y: {} steps: {}", location.x, location.y, step_count);
    let cell_raw = grid.get_cell_value(location.x, location.y);
    if cell_raw.is_none() {
        return None;
    }
    let mut hill_location = cell_raw.unwrap();
    // set current mark
    hill_location.last_visited = Some(step_count);
    if hill_location.best_last_visited.is_none()
        || hill_location.best_last_visited.unwrap() > step_count
    {
        hill_location.best_last_visited = Some(step_count);
    } else {
        return None;
    }
    if hill_location.raw_char == 'S'
        && (hill_location.best_last_visited.is_none()
            || hill_location.best_last_visited.unwrap() > step_count)
    {
        grid.set_cell_value(location.x, location.y, hill_location.clone());
        store_best_last_visited(grid);
        print_field(grid);
        // RESET FIELD
        hill_location = grid.get_cell_value(location.x, location.y).unwrap();
        hill_location.last_visualization = None;
        hill_location.last_visited = None;
        grid.set_cell_value(location.x, location.y, hill_location.clone());
        return Some(step_count);
    } else {
        for direction in BASIC_DIRECTIONS.iter() {
            let target_location = Location {
                x: location.x + direction.x,
                y: location.y + direction.y,
            };
            let other_location_raw = grid.get_cell_value(target_location.x, target_location.y);
            if other_location_raw.is_none() {
                continue;
            }
            let other_location = other_location_raw.unwrap();
            if !other_location.can_move_to_reverse(hill_location.clone(), step_count + 1) {
                continue;
            }
            hill_location.last_visualization = Some(direction.visualization);
            grid.set_cell_value(location.x, location.y, hill_location.clone());
            move_to_start(grid, target_location, step_count + 1);
        }
    }

    // reset current mark
    hill_location = grid.get_cell_value(location.x, location.y).unwrap();
    hill_location.last_visualization = None;
    hill_location.last_visited = None;
    grid.set_cell_value(location.x, location.y, hill_location.clone());
    None
}

fn get_hill_height(input: char) -> i32 {
    let mut height_char = input;
    if input == 'S' {
        height_char = 'a';
    } else if input == 'E' {
        height_char = 'z';
    }
    return height_char as i32;
}

#[test]
fn hill_height_conversion() {
    assert_eq!(get_hill_height('a'), 97);
    assert_eq!(get_hill_height('S'), 97);
    assert_eq!(get_hill_height('z'), 122);
    assert_eq!(get_hill_height('E'), 122);
    assert_eq!(get_hill_height('o'), 111);
}

fn part_1(input: &str) -> usize {
    let mut hill_field = HillField::new(input);
    unsafe { BEST_SCORE = -1 };
    hill_field.calculate_fastest_path();
    let end_field = hill_field
        .grid
        .get_cell_value(hill_field.start.x, hill_field.start.y)
        .unwrap();
    end_field.best_last_visited.unwrap() as usize
}

#[test]
fn day_12_part_1_example() {
    let raw_input_example = include_str!("input.example");
    assert_eq!(part_1(raw_input_example), 31);
}
#[test]
fn day_12_part_1() {
    let input = include_str!("input");
    println!("{}", part_1(input))
}

fn main() {
    let raw_input_example = include_str!("input.example");
    part_1(raw_input_example);
}
