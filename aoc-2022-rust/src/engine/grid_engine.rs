use std::{cell::RefCell, collections::HashMap, rc::Rc};

pub struct Location {
    pub x: isize,
    pub y: isize,
}
impl Clone for Location {
    fn clone(&self) -> Self {
        Location {
            x: self.x,
            y: self.y,
        }
    }
}
pub struct Direction {
    pub x: isize,
    pub y: isize,
    pub visualization: char,
}

pub const UP: Direction = Direction {
    x: 0,
    y: -1,
    visualization: 'V',
};
pub const DOWN: Direction = Direction {
    x: 0,
    y: 1,
    visualization: '^',
};
pub const LEFT: Direction = Direction {
    x: -1,
    y: 0,
    visualization: '>',
};
pub const RIGHT: Direction = Direction {
    x: 1,
    y: 0,
    visualization: '<',
};
pub const BASIC_DIRECTIONS: [Direction; 4] = [UP, DOWN, LEFT, RIGHT];

pub struct GridCell<T> {
    pub x: isize,
    pub y: isize,
    pub value: T,
}

impl<T: Clone> Clone for GridCell<T> {
    fn clone(&self) -> Self {
        GridCell {
            x: self.x,
            y: self.y,
            value: self.value.clone(),
        }
    }
}

pub type CellLink<T> = Rc<RefCell<GridCell<T>>>;

pub type GridMap<T> = HashMap<isize, HashMap<isize, CellLink<T>>>;

pub struct Grid<T: Clone> {
    pub min_x: isize,
    pub max_x: isize,
    pub min_y: isize,
    pub max_y: isize,

    pub map: GridMap<T>,
}

pub struct MapBoundaries {
    pub min_x: isize,
    pub max_x: isize,
    pub min_y: isize,
    pub max_y: isize,
}

impl MapBoundaries {
    pub fn default() -> Self {
        MapBoundaries {
            min_x: 0,
            min_y: 0,
            max_x: 0,
            max_y: 0,
        }
    }
}

impl<T: Clone> Grid<T> {
    pub fn set_cell_value(&mut self, x: isize, y: isize, value: T) -> Rc<RefCell<GridCell<T>>> {
        let x_map = self.map.entry(y).or_default();
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
        x_map.insert(x, Rc::new(RefCell::new(GridCell { x, y, value })));
        self.get_cell(x, y).unwrap()
    }

    pub fn mutate_cell(&mut self, x: isize, y: isize, f: fn(Option<T>) -> Option<T>) {
        let cell = self.get_cell_value(x, y);
        let new_value = f(cell);
        if new_value.is_none() {
            return;
        }
        self.set_cell_value(x, y, new_value.unwrap());
    }

    pub fn get_cell(&self, x: isize, y: isize) -> Option<Rc<RefCell<GridCell<T>>>> {
        if !self.map.contains_key(&y) {
            return None;
        }
        let y_map = self.map.get(&y).unwrap();
        if !y_map.contains_key(&x) {
            return None;
        }
        let cell = y_map.get(&x).unwrap().clone();
        Some(cell)
    }

    pub fn get_cell_value(&self, x: isize, y: isize) -> Option<T> {
        let cell = self.get_cell(x, y);
        cell.as_ref()?;
        Some(self.get_cell(x, y).unwrap().as_ref().borrow().value.clone())
    }

    pub fn new(boundaries: Option<MapBoundaries>) -> Self {
        let b = boundaries.unwrap_or(MapBoundaries::default());
        Grid {
            min_x: b.min_x,
            min_y: b.min_y,
            max_x: b.max_x,
            max_y: b.max_y,
            map: HashMap::new(),
        }
    }

    pub fn new_from_lines(
        lines: Vec<String>,
        parse_line: fn(String) -> Vec<T>,
        min_x_arg: Option<isize>,
        min_y_arg: Option<isize>,
    ) -> Self {
        let min_x = min_x_arg.unwrap_or(0);
        let min_y = min_y_arg.unwrap_or(0);
        let max_x = 0;
        let mut max_y = 0;

        let mut map: GridMap<T> = HashMap::new();
        for (y, line) in lines.iter().enumerate() {
            max_y = min_y + y as isize;
            map.entry(y as isize).or_insert_with(HashMap::new);
            let parsed_values = parse_line(line.clone());
            for (_x, _value) in parsed_values.into_iter().enumerate() {}
        }
        Grid {
            min_x,
            min_y,
            max_x,
            max_y,
            map,
        }
    }

    pub fn print(&self, print_value: fn(Option<T>) -> String) {
        println!(
            "x: {} - {} y: {} - {}",
            self.min_x, self.max_x, self.min_y, self.max_y
        );
        for y in self.min_y..=self.max_y {
            let mut print_line = "".to_string();
            for x in self.min_x..=self.max_x {
                let cell = self.get_cell_value(x, y);
                let parsed = print_value(cell);
                print_line += &parsed;
            }
            println!("{}", print_line);
        }
    }

    pub fn iterate(&self, f: fn(Option<T>)) {
        for y in self.min_y..=self.max_y {
            (self.min_x..=self.max_x)
                .map(|x| self.get_cell_value(x, y))
                .for_each(f)
        }
    }
    pub fn iterate_mut(&mut self, f: fn(Option<T>) -> Option<T>) {
        for y in self.min_y..=self.max_y {
            for x in self.min_x..=self.max_x {
                self.mutate_cell(x, y, f);
            }
        }
    }
}
