use crate::engine::grid_engine::{Grid, Location, MapBoundaries};

use super::cave_material::CaveMaterial;

#[derive(Clone)]
struct CaveCell {
    material: CaveMaterial,
}

pub struct RegolithReservoir {
    grid: Grid<CaveCell>,
}

impl RegolithReservoir {
    pub fn new() -> Self {
        RegolithReservoir {
            grid: Grid::new(Some(MapBoundaries {
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
                    self.grid.set_cell_value(
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

    fn next_sand_location(&self, x: isize, y: isize) -> Option<Location> {
        let current = self.grid.get_cell_value(x, y);
        if current.is_some() {
            return None;
        }
        let down = self.grid.get_cell_value(x, y + 1);
        if down.is_none() {
            return Some(Location { x, y: y + 1 });
        }
        let down_left = self.grid.get_cell_value(x - 1, y + 1);
        if down_left.is_none() {
            return Some(Location { x: x - 1, y: y + 1 });
        }
        let down_right = self.grid.get_cell_value(x + 1, y + 1);
        if down_right.is_none() {
            return Some(Location { x: x + 1, y: y + 1 });
        }
        None
    }
    pub fn drop_sand_grain(&mut self) -> bool {
        let mut x = 500;
        let mut y = 0;
        let max_y = self.grid.max_y;
        let mut can_continue = true;
        let mut can_place_sand = false;

        while can_continue {
            let next_sand_location = self.next_sand_location(x, y);
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
            self.grid.set_cell_value(
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
