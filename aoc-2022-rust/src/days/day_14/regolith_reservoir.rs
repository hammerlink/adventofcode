use crate::engine::{
    grid::{
        boundaries::Boundaries,
        directions::{Direction, DOWN, DOWN_LEFT, DOWN_RIGHT},
        grid::Grid,
    },
    grid_engine::Location,
};

use super::cave_material::CaveMaterial;

#[derive(Clone)]
pub struct CaveCell {
    material: CaveMaterial,
}

pub struct RegolithReservoir {
    pub grid: Grid<CaveCell>,
}

pub const SAND_MOVEMENT_DIRECTIONS: [Direction; 3] = [DOWN, DOWN_LEFT, DOWN_RIGHT];

impl RegolithReservoir {
    pub fn new() -> Self {
        RegolithReservoir {
            grid: Grid::new(Some(Boundaries {
                min_x: 500,
                max_x: 500,
                min_y: 0,
                max_y: 0,
            })),
        }
    }
    pub fn apply_rock_location_sequence(&mut self, locations: &Vec<Location>) {
        if locations.is_empty() {
            return;
        }
        let mut current_location = &locations[0];
        locations.iter().for_each(|location| {
            let min_x = std::cmp::min(location.x, current_location.x);
            let max_x = std::cmp::max(location.x, current_location.x);
            let min_y = std::cmp::min(location.y, current_location.y);
            let max_y = std::cmp::max(location.y, current_location.y);
            for y in min_y..=max_y {
                for x in min_x..=max_x {
                    self.grid.update_cell(
                        x,
                        y,
                        CaveCell {
                            material: CaveMaterial::Rock,
                        },
                    );
                }
            }
            current_location = location;
        })
    }
    pub fn print(&self) {
        self.grid.print(|cell_option| match cell_option {
            Some(cell) => format!("{}", cell.material),
            None => ".".to_string(),
        });
    }

    fn next_sand_location(&self, x: isize, y: isize, max_y: Option<isize>) -> Option<Location> {
        if max_y.is_some() && y >= max_y.unwrap() {
            return None;
        }
        if self.grid.has_cell(x, y) {
            return None;
        }
        let next_location = SAND_MOVEMENT_DIRECTIONS
            .iter()
            .find(|direction| !self.grid.has_cell(x + direction.x, y + direction.y));
        match next_location {
            Some(direction) => Some(Location {
                x: x + direction.x,
                y: y + direction.y,
            }),
            None => None,
        }
    }
    pub fn drop_sand_grain_part_2(&mut self, max_y: isize) -> bool {
        let mut x = 500;
        let mut y = 0;
        let mut can_continue = true;
        let mut can_place_sand = false;

        while can_continue {
            let next_sand_location = self.next_sand_location(x, y, Some(max_y));
            match next_sand_location {
                None => {
                    can_continue = false;
                    if !(x == 500 && y == 0) {
                        can_place_sand = true;
                    }
                }
                Some(location) => {
                    x = location.x;
                    y = location.y;
                }
            }
            if y >= max_y - 1 {
                can_continue = false;
                can_place_sand = true;
            }
        }
        if can_place_sand {
            self.grid.update_cell(
                x,
                y,
                CaveCell {
                    material: CaveMaterial::RestedSand,
                },
            );
        }
        can_place_sand
    }
    pub fn drop_sand_grain(&mut self) -> bool {
        let mut x = 500;
        let mut y = 0;
        let max_y = self.grid.boundaries.max_y;
        let mut can_continue = true;
        let mut can_place_sand = false;

        while can_continue {
            let next_sand_location = self.next_sand_location(x, y, None);
            match next_sand_location {
                None => {
                    can_continue = false;
                    can_place_sand = true;
                }
                Some(location) => {
                    x = location.x;
                    y = location.y;
                }
            }
            if y > max_y {
                can_continue = false;
            }
        }
        if can_place_sand {
            self.grid.update_cell(
                x,
                y,
                CaveCell {
                    material: CaveMaterial::RestedSand,
                },
            );
        }
        can_place_sand
    }
}
