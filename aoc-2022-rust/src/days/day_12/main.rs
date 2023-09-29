use crate::engine::{grid_engine::{Grid, Location}, grid::directions::BASIC_DIRECTIONS};


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

    pub fn get_best_start_point(&self) -> i32 {
        let l: HillLocation = self
            .grid
            .get_cell_value(self.start.x, self.start.y)
            .unwrap();
        let mut best_score = l.best_last_visited.unwrap();
        for y in self.grid.min_y..=self.grid.max_y {
            for x in self.grid.min_x..=self.grid.max_x {
                let c = self.grid.get_cell_value(x, y);
                if c.is_none() {
                    continue;
                }
                let cell = c.unwrap();
                if cell.height != 97 {
                    continue;
                }
                if !cell.best_last_visited.is_none() {
                    let cell_best = cell.best_last_visited.unwrap();
                    if cell_best < best_score {
                        best_score = cell_best;
                    }
                }
            }
        }
        best_score
    }
}

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

#[allow(dead_code)]
fn part_1(input: &str) -> usize {
    let mut hill_field = HillField::new(input);
    hill_field.calculate_fastest_path();
    let end_field = hill_field
        .grid
        .get_cell_value(hill_field.start.x, hill_field.start.y)
        .unwrap();
    end_field.best_last_visited.unwrap() as usize
}

#[allow(dead_code)]
fn part_2(input: &str) -> usize {
    let mut hill_field = HillField::new(input);
    hill_field.calculate_fastest_path();
    hill_field.get_best_start_point() as usize
}

#[test]
fn day_12_part_1_example() {
    let raw_input_example = include_str!("input.example");
    assert_eq!(part_1(raw_input_example), 31);
}
#[test]
fn day_12_part_1() {
    let input = include_str!("input");
    assert_eq!(part_1(input), 456);
}
#[test]
fn day_12_part_2_example() {
    let input = include_str!("input.example");
    assert_eq!(part_2(input), 29);
}
#[test]
fn day_12_part_2() {
    let input = include_str!("input");
    println!("{}", part_2(input));
}
