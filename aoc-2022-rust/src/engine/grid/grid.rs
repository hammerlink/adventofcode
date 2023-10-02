use std::collections::HashMap;

use super::{boundaries::Boundaries, cell::MapCell};

pub type GridCell<T> = MapCell<Option<T>>;

impl<T> GridCell<T> {
    pub fn borrow_value(&self) -> Option<&T> {
        self.value.as_ref()
    }
}

pub struct Grid<T> {
    pub boundaries: Boundaries,
    pub map: HashMap<isize, HashMap<isize, GridCell<T>>>,
}

impl<T> Grid<T> {
    pub fn new(boundaries: Option<Boundaries>) -> Self {
        Grid {
            boundaries: match boundaries {
                Some(boundaries) => boundaries,
                _ => Boundaries {
                    min_x: 0,
                    max_x: 0,
                    min_y: 0,
                    max_y: 0,
                },
            },
            map: HashMap::new(),
        }
    }
    pub fn has_cell(&self, x: isize, y: isize) -> bool {
        if !self.map.contains_key(&y) {
            return false;
        }
        let x_map = self.map.get(&y).unwrap();
        x_map.contains_key(&x)
    }
    pub fn borrow_cell(&self, x: isize, y: isize) -> Option<&GridCell<T>> {
        if !self.map.contains_key(&y) {
            return None;
        }
        let x_map = self.map.get(&y).unwrap();
        if !x_map.contains_key(&x) {
            return None;
        }
        x_map.get(&x)
    }

    pub fn borrow_mut_cell(&mut self, x: isize, y: isize) -> Option<&mut GridCell<T>> {
        let x_map = self.map.entry(y).or_default();
        if !x_map.contains_key(&x) {
            return None;
        }
        x_map.get_mut(&x)
    }

    pub fn update_cell(&mut self, x: isize, y: isize, value: T) -> &GridCell<T> {
        let x_map = self.map.entry(y).or_default();
        let cell = x_map.entry(x).or_insert(MapCell { x, y, value: None });
        cell.value = Some(value);
        self.boundaries.update(x, y);
        &x_map[&x]
    }
    pub fn print(&self, print_value: fn(Option<&T>) -> String) {
        let Boundaries {
            min_x,
            min_y,
            max_x,
            max_y,
        } = self.boundaries;
        println!("x: {} - {} y: {} - {}", min_x, max_x, min_y, max_y);
        for y in min_y..=max_y {
            let mut print_line = "".to_string();
            for x in min_x..=max_x {
                print_line += &print_value(match self.borrow_cell(x, y) {
                    Some(cell) => cell.borrow_value(),
                    _ => None,
                });
            }
            println!("{}", print_line);
        }
    }
}
