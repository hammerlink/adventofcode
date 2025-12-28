use std::collections::HashMap;

pub struct Position {
    pub x: i32,
    pub y: i32,
}

pub struct Cell<V> {
    pub x: i32,
    pub y: i32,
    pub value: V,
}

pub struct Boundaries {
    pub min_x: i32,
    pub max_x: i32,
    pub min_y: i32,
    pub max_y: i32,
}

impl Boundaries {
    pub fn new() -> Self {
        Boundaries {
            min_x: 0,
            max_x: 0,
            min_y: 0,
            max_y: 0,
        }
    }
    pub fn update_boundaries(&mut self, x: i32, y: i32) {
        if x > self.max_x {
            self.max_x = x;
        }
        if x < self.min_x {
            self.min_x = x;
        }
        if y > self.max_y {
            self.max_y = y;
        }
        if y < self.min_y {
            self.min_y = y;
        }
    }
}

pub struct Map2d<V> {
    /// [y][x]
    values: HashMap<i32, HashMap<i32, Cell<V>>>,
    pub boundaries: Boundaries,
}

impl<V> Default for Map2d<V> {
    fn default() -> Self {
        Self::new()
    }
}

impl<V> Map2d<V> {
    pub fn new() -> Self {
        Map2d {
            values: HashMap::new(),
            boundaries: Boundaries::new(),
        }
    }
    pub fn set_value(&mut self, x: i32, y: i32, v: V) {
        self.boundaries.update_boundaries(x, y);
        self.values
            .entry(y)
            .or_default()
            .insert(x, Cell { x, y, value: v });
    }
    pub fn get_value(&self, x: i32, y: i32) -> &Cell<V> {
        self.values.get(&y).unwrap().get(&x).unwrap()
    }
    pub fn try_get_value(&self, x: i32, y: i32) -> Option<&Cell<V>> {
        if let Some(y_map) = self.values.get(&y) {
            return y_map.get(&x);
        }
        None
    }
    pub fn has_value(&self, x: i32, y: i32) -> bool {
        if let Some(y_map) = self.values.get(&y) {
            return y_map.contains_key(&x);
        }
        false
    }
    pub fn get_value_mut(&mut self, x: i32, y: i32) -> &mut Cell<V> {
        self.values.get_mut(&y).unwrap().get_mut(&x).unwrap()
    }
    pub fn get_adjacent_values(&self, x: i32, y: i32) -> Vec<&Cell<V>> {
        let mut output = vec![];
        for y_offset in -1..=1 {
            for x_offset in -1..=1 {
                if x_offset == 0 && y_offset == 0 {
                    continue;
                }
                if let Some(cell) = self.try_get_value(x + x_offset, y + y_offset) {
                    output.push(cell);
                }
            }
        }
        output
    }
    pub fn iter_all(&self) -> impl Iterator<Item = &Cell<V>> {
        let b = &self.boundaries;
        (b.min_y..=b.max_y)
            .flat_map(move |y| (b.min_x..=b.max_x).filter_map(move |x| self.try_get_value(x, y)))
    }
}
