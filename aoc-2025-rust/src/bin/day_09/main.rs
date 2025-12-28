const EXAMPLE_INPUT: &str = include_str!("./y2025_day09.example");
const INPUT: &str = include_str!("./y2025_day09.input");

mod part1 {
    use std::{
        cell::RefCell,
        cmp::{max, min},
        fmt::Display,
    };

    use aoc_2025_rust::map::Map2d;

    struct Rect {
        top_left: Position,
        bottom_right: Position,
    }

    impl Rect {
        fn new(a: Position, b: Position) -> Self {
            let min_x = std::cmp::min(a.x, b.x);
            let max_x = std::cmp::max(a.x, b.x);
            let min_y = std::cmp::min(a.y, b.y);
            let max_y = std::cmp::max(a.y, b.y);
            Self {
                top_left: Position { x: min_x, y: min_y },
                bottom_right: Position { x: max_x, y: max_y },
            }
        }
        fn new_line_inner_rect(
            a: &Position,
            b: &Position,
            direction: &Direction,
            existing_rect: &Rect,
        ) -> Self {
            let mut min_x = min(a.x, b.x);
            let mut max_x = max(a.x, b.x);
            let mut min_y = min(a.y, b.y);
            let mut max_y = max(a.y, b.y);
            if direction.is_horizontal() {
                min_x = min_x.saturating_sub(1);
                max_x += 1;
            } else {
                min_y = min_y.saturating_sub(1);
                max_y += 1;
            }
            if min_x < existing_rect.top_left.x {
                min_x = existing_rect.top_left.x;
            }
            if min_y < existing_rect.top_left.y {
                min_y = existing_rect.top_left.y;
            }
            if max_x > existing_rect.bottom_right.x {
                max_x = existing_rect.bottom_right.x;
            }
            if max_y > existing_rect.bottom_right.y {
                max_y = existing_rect.bottom_right.y;
            }
            Self {
                top_left: Position { x: min_x, y: min_y },
                bottom_right: Position { x: max_x, y: max_y },
            }
        }

        fn is_in_x_range(&self, position: &Position) -> bool {
            position.x >= self.top_left.x && position.x <= self.bottom_right.x
        }
        fn is_in_y_range(&self, position: &Position) -> bool {
            position.y >= self.top_left.y && position.y <= self.bottom_right.y
        }
        fn is_y_overlapping(&self, line: &Line) -> bool {
            let min_y = std::cmp::min(line.start.y, line.end.y);
            let max_y = std::cmp::max(line.start.y, line.end.y);

            self.top_left.y <= max_y && min_y <= self.bottom_right.y
        }
        fn is_x_overlapping(&self, line: &Line) -> bool {
            let min_x = std::cmp::min(line.start.x, line.end.x);
            let max_x = std::cmp::max(line.start.x, line.end.x);

            self.top_left.y <= max_x && min_x <= self.bottom_right.y
        }
        fn is_in_rect(&self, position: &Position) -> bool {
            self.is_in_x_range(position) && self.is_in_y_range(position)
        }
        fn is_line_in_rect(&self, line: &Line) -> bool {
            let start_in_x_range = self.is_in_x_range(&line.start);
            let start_in_y_range = self.is_in_y_range(&line.start);
            let end_in_x_range = self.is_in_x_range(&line.end);
            let end_in_y_range = self.is_in_y_range(&line.end);
            if (start_in_x_range && start_in_y_range) || (end_in_x_range && end_in_y_range) {
                return true;
            }
            if (start_in_x_range || end_in_x_range) && self.is_y_overlapping(line) {
                return true;
            }
            if (start_in_y_range || end_in_y_range) && self.is_x_overlapping(line) {
                return true;
            }
            false
        }
        fn width(&self) -> usize {
            self.bottom_right.x - self.top_left.x + 1
        }
        fn height(&self) -> usize {
            self.bottom_right.y - self.top_left.y + 1
        }
    }

    #[derive(Debug, PartialEq)]
    enum CellType {
        Outer,
        Inner,
        Selection,
        RedTile,
        GreenTile,
    }

    impl CellType {
        fn to_string(&self) -> &str {
            match self {
                CellType::Outer => "^",
                CellType::Inner => "o",
                CellType::Selection => "O",
                CellType::RedTile => "#",
                CellType::GreenTile => "X",
            }
        }
    }

    type TileMap = Map2d<CellType>;

    #[derive(Debug, PartialEq, Eq, Clone)]
    pub enum Direction {
        Up,
        Left,
        Down,
        Right,
    }
    impl Display for Direction {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            let direction_str = match self {
                Direction::Up => "Up",
                Direction::Left => "Left",
                Direction::Down => "Down",
                Direction::Right => "Right",
            };
            write!(f, "{}", direction_str)
        }
    }

    impl Direction {
        fn new(start: &Position, end: &Position) -> Self {
            if start.x == end.x {
                if start.y < end.y {
                    return Direction::Down;
                }
                Direction::Up
            } else {
                if start.x > end.x {
                    return Direction::Left;
                }
                Direction::Right
            }
        }

        fn is_horizontal(&self) -> bool {
            *self == Direction::Left || *self == Direction::Right
        }

        fn get_new_inner_direction(
            &self,
            previous_direction: &Direction,
            next_direction: &Direction,
        ) -> Self {
            match (previous_direction, next_direction) {
                // Right turns (clockwise)
                (Direction::Up, Direction::Right)
                | (Direction::Right, Direction::Down)
                | (Direction::Down, Direction::Left)
                | (Direction::Left, Direction::Up) => match self {
                    Direction::Up => Direction::Right,
                    Direction::Right => Direction::Down,
                    Direction::Down => Direction::Left,
                    Direction::Left => Direction::Up,
                },
                // // Left turns (counter-clockwise)
                (Direction::Up, Direction::Left)
                | (Direction::Left, Direction::Down)
                | (Direction::Down, Direction::Right)
                | (Direction::Right, Direction::Up) => match self {
                    Direction::Up => Direction::Left,
                    Direction::Left => Direction::Down,
                    Direction::Down => Direction::Right,
                    Direction::Right => Direction::Up,
                },
                // Straight line (no turn) - inner direction stays the same
                _ => self.clone(),
            }
        }
    }

    pub struct Line {
        pub start: Position,
        pub end: Position,
        pub direction: Direction,
        pub inner_direction: RefCell<Option<Direction>>,
    }

    impl PartialEq for Line {
        fn eq(&self, other: &Line) -> bool {
            self.start == other.start && self.end == other.end
        }
    }

    impl Line {
        fn new(start: Position, end: Position) -> Self {
            Self {
                direction: Direction::new(&start, &end),
                start,
                end,
                inner_direction: None.into(),
            }
        }

        fn has_position(&self, position: &Position) -> bool {
            self.start == *position || self.end == *position
        }

        // TODO this is still wrong
        // you need to cast your ray and see if you encounter anything
        // it can pass or take the same line.
        // but it cannot put an outer piece in it
        // OR potentially a line next to another line is breaking it
        fn is_crossing(&self, other: &Line) -> bool {
            if self.has_position(&other.start) || self.has_position(&other.end) {
                return false;
            }
            // lines can only match one arm
            let self_horizontal = self.direction.is_horizontal();
            let other_horizontal = other.direction.is_horizontal();
            if self_horizontal == other_horizontal {
                false // parallel
            } else if self_horizontal {
                // self is horizontal, other is vertical
                let self_y = self.start.y;
                let other_x = other.start.x;

                // Check if intersection point is within both line segments
                other_x >= std::cmp::min(self.start.x, self.end.x)
                    && other_x <= std::cmp::max(self.start.x, self.end.x)
                    && self_y >= std::cmp::min(other.start.y, other.end.y)
                    && self_y <= std::cmp::max(other.start.y, other.end.y)
            } else {
                let self_x = self.start.x; // self is vertical, so fixed x
                let other_y = other.start.y; // other is horizontal so fixed y

                // Check if intersection point is within both line segments
                self_x >= std::cmp::min(other.start.x, other.end.x)     // self's x within other's x range
                 && self_x <= std::cmp::max(other.start.x, other.end.x) // self's x within other's x range
                 && other_y >= std::cmp::min(self.start.y, self.end.y)  // other's y within self's y range
                 && other_y <= std::cmp::max(self.start.y, self.end.y) // other's y within self's y range
            }
        }
    }

    struct Bounds {
        pub min_x: usize,
        pub max_x: usize,
        pub min_y: usize,
        pub max_y: usize,
    }

    impl Bounds {
        fn from_position(position: &Position) -> Self {
            Self {
                min_x: position.x,
                max_y: position.y,
                min_y: position.y,
                max_x: position.x,
            }
        }
        fn update(&mut self, position: &Position) {
            if position.x < self.min_x {
                self.min_x = position.x
            }
            if position.x > self.max_x {
                self.max_x = position.x
            }
            if position.y < self.min_y {
                self.min_y = position.y
            }
            if position.y > self.max_y {
                self.max_y = position.y
            }
        }
    }

    #[derive(Debug, Clone)]
    pub struct Position {
        pub x: usize,
        pub y: usize,
    }

    impl PartialEq for Position {
        fn eq(&self, other: &Position) -> bool {
            self.x == other.x && self.y == other.y
        }
    }

    impl Display for Position {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "({},{})", self.x, self.y)
        }
    }

    impl Position {
        pub fn new(line: &str) -> Self {
            let pieces: Vec<&str> = line.split(",").collect();
            Position {
                x: pieces.first().unwrap().parse().unwrap(),
                y: pieces.get(1).unwrap().parse().unwrap(),
            }
        }
        pub fn calculate_size(&self, other: &Position) -> usize {
            let x_size = std::cmp::max(self.x, other.x) - std::cmp::min(self.x, other.x) + 1;
            let y_size = std::cmp::max(self.y, other.y) - std::cmp::min(self.y, other.y) + 1;

            x_size * y_size
        }
        fn origin_distance(&self) -> f64 {
            let dx = self.x as f64 - 0_f64;
            let dy = self.y as f64 - 0_f64;
            (dx * dx + dy * dy).sqrt()
        }
    }
    #[test]
    fn test_caluculate_size() {
        let a = Position::new("2,5");
        let b = Position::new("9,7");
        assert_eq!(a.calculate_size(&b), 24);
    }

    struct TileCalculator {
        bounds: Bounds,
        positions: Vec<Position>,
        lines: Vec<Line>,
        tile_map: TileMap,
    }

    impl TileCalculator {
        fn new(positions: Vec<Position>) -> Self {
            let mut bounds = Bounds::from_position(positions.first().unwrap());
            let mut lines = vec![];
            for window in positions.windows(2) {
                let line = {
                    if let [previous, current] = window {
                        bounds.update(current);
                        Line::new(previous.clone(), current.clone())
                    } else {
                        unreachable!("windows(2) should always have 2 elements");
                    }
                };
                let has_crossing = lines.iter().any(|other: &Line| {
                    !(other.end.x == line.start.x && other.end.y == line.start.y)
                        && line.is_crossing(other)
                });
                if has_crossing {
                    // no crossing is going on
                    println!("CROSSING!!!");
                }
                lines.push(line);
            }
            lines.push(Line::new(
                positions.last().unwrap().clone(),
                positions.first().unwrap().clone(),
            ));
            Self {
                lines,
                bounds,
                positions,
                tile_map: Map2d::default(),
            }
        }

        fn fill_map(&mut self) {
            self.fill_inner_direction();
            for line in self.lines.iter() {
                let min_x = min(line.start.x, line.end.x);
                let max_x = max(line.start.x, line.end.x);
                let min_y = min(line.start.y, line.end.y);
                let max_y = max(line.start.y, line.end.y);
                for x in min_x..=max_x {
                    for y in min_y..=max_y {
                        self.tile_map
                            .set_value(x as i32, y as i32, CellType::GreenTile);
                        let (inner_x, inner_y, outer_x, outer_y) = {
                            match *line.inner_direction.borrow() {
                                Some(Direction::Up) => {
                                    (x as i32, y as i32 - 1, x as i32, y as i32 + 1)
                                }
                                Some(Direction::Down) => {
                                    (x as i32, y as i32 + 1, x as i32, y as i32 - 1)
                                }
                                Some(Direction::Left) => {
                                    (x as i32 - 1, y as i32, x as i32 + 1, y as i32)
                                }
                                Some(Direction::Right) => {
                                    (x as i32 + 1, y as i32, x as i32 - 1, y as i32)
                                }
                                _ => unreachable!("ashould have inner"),
                            }
                        };
                        if !self.tile_map.has_value(inner_x, inner_y) {
                            self.tile_map.set_value(inner_x, inner_y, CellType::Inner);
                        }
                        if !self.tile_map.has_value(outer_x, outer_y) {
                            self.tile_map.set_value(outer_x, outer_y, CellType::Outer);
                        }
                    }
                }
                self.tile_map.set_value(
                    line.start.x as i32,
                    line.start.y as i32,
                    CellType::RedTile,
                );
                self.tile_map
                    .set_value(line.end.x as i32, line.end.y as i32, CellType::RedTile);
            }
        }

        fn print_map(&self) {
            for y in self.tile_map.boundaries.min_y..=self.tile_map.boundaries.max_y {
                let mut line: String = "".to_string();
                for x in self.tile_map.boundaries.min_x..=self.tile_map.boundaries.max_x {
                    let map_value = self.tile_map.try_get_value(x, y);
                    if let Some(v) = map_value {
                        line = format!("{}{}", line, v.value.to_string());
                    } else {
                        line = format!("{}.", line);
                    }
                }
                println!("{line}");
            }
        }

        fn fill_inner_direction(&mut self) {
            let index_offset = self
                .lines
                .iter()
                .position(|line| {
                    line.start.x == self.bounds.max_x
                        && (line.direction == Direction::Up || line.direction == Direction::Down)
                })
                .expect("it has a vert line at the max x");

            let mut last_line = &self.lines[index_offset];
            let mut inner_direction = match last_line.direction {
                Direction::Up => Direction::Right,
                _ => Direction::Left,
            };
            *last_line.inner_direction.borrow_mut() = Some(inner_direction.clone());
            for i in 1..self.lines.len() {
                let index = (i + index_offset) % self.lines.len();
                let new_line = &self.lines[index];
                inner_direction = inner_direction
                    .get_new_inner_direction(&last_line.direction, &new_line.direction);
                *new_line.inner_direction.borrow_mut() = Some(inner_direction.clone());
                last_line = new_line;
            }
            if self
                .lines
                .iter()
                .any(|l| l.inner_direction.borrow().is_none())
            {
                panic!("should not contain empty inner direction");
            }
        }

        fn has_tileless_cells(&self, rect: &Rect, related_lines: &[&Line]) -> bool {
            // go through borders
            // go through inner borders
            for line in related_lines.iter() {
                let inner_rect =
                    Rect::new_line_inner_rect(&line.start, &line.end, &line.direction, rect);
                for y in inner_rect.top_left.y..=inner_rect.bottom_right.y {
                    for x in inner_rect.top_left.x..=inner_rect.bottom_right.x {
                        if let Some(v) = self.tile_map.try_get_value(x as i32, y as i32)
                            && v.value == CellType::Outer
                        {
                            return true;
                        }
                    }
                }
            }
            false
        }

        fn has_tileless_cells_full_scan(&self, rect: &Rect) -> bool {
            for y in rect.top_left.y..=rect.bottom_right.y {
                for x in rect.top_left.x..=rect.bottom_right.x {
                    if let Some(v) = self.tile_map.try_get_value(x as i32, y as i32)
                        && v.value == CellType::Outer
                    {
                        println!("OUTER SKIP x: {}, y: {}", x, y);
                        for y in (y - 1)..=(y + 1) {
                            let mut line: String = "".to_string();
                            for x in (x - 1)..=(x + 1) {
                                line = format!("{}{}", line, {
                                    if let Some(v) = self.tile_map.try_get_value(x as i32, y as i32)
                                    {
                                        v.value.to_string()
                                    } else {
                                        "."
                                    }
                                })
                            }
                            println!("{line}");
                        }

                        return true;
                    }
                }
            }
            false
        }

        fn find_largest_rect(&mut self) -> usize {
            self.positions
                .sort_by(|a, b| a.x.cmp(&b.x).then(a.y.cmp(&b.y)));

            let mut largest_rect_size: usize = 0;
            let mut best: Option<(Position, Position)> = None;

            for i in 0..self.positions.len() {
                let start = &self.positions[i];
                println!("trying {} / {}", i, self.positions.len());
                for j in (i + 1)..self.positions.len() {
                    let other = &self.positions[j];
                    let rect_size = start.calculate_size(other);
                    if rect_size < largest_rect_size {
                        continue;
                    }
                    let rect = Rect::new(start.clone(), other.clone());
                    // HERE
                    let related_lines: Vec<&Line> = self
                        .lines
                        .iter()
                        .filter(|line| rect.is_line_in_rect(line))
                        .collect();
                    if self.has_tileless_cells(&rect, &related_lines) {
                        continue;
                    }
                    if self.has_tileless_cells_full_scan(&rect) {
                        println!(
                            "FULL SCAN SKIP: {} -- start: {} end: {}, related liens: {}",
                            rect_size,
                            start,
                            other,
                            related_lines.len()
                        );
                        continue;
                    }

                    println!(
                        "NEW SIZE: {} -- start: {} end: {}, related liens: {}",
                        rect_size,
                        start,
                        other,
                        related_lines.len()
                    );
                    best = Some((start.clone(), other.clone()));

                    largest_rect_size = rect_size;
                }
            }
            if let Some((start, other)) = best {
                self.tile_map
                    .set_value(start.x as i32, start.y as i32, CellType::Selection);
                self.tile_map
                    .set_value(other.x as i32, other.y as i32, CellType::Selection);
            }
            largest_rect_size
        }
    }

    #[allow(unused)]
    pub fn execute_part1(input: &str) -> usize {
        let mut positions: Vec<Position> = input.lines().map(Position::new).collect();
        positions.sort_by(|a, b| a.origin_distance().total_cmp(&b.origin_distance()));
        let start = positions.first().unwrap();
        let end = positions.last().unwrap();
        start.calculate_size(end)
    }

    pub fn execute_part2(input: &str, print: bool) -> usize {
        let mut tile_calculator = TileCalculator::new(input.lines().map(Position::new).collect());
        // TODO redo completely
        // 1 build polygon
        // 2 determine inside & outside, probably on the last point
        // 3 try each point, and try to cast all possible rectangles for that point
        // => at this point I still need a way to know if there is something insterecting or not...
        // how to draw a line from one point to another and now that there is no interference?
        //
        // TODO DEBUG => why is my crossing going wrong. i need to see it!!
        tile_calculator.fill_map();
        println!("MAP FILLED");
        let result = tile_calculator.find_largest_rect();
        if print {
            tile_calculator.print_map();
        }
        result
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 50);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT);
    println!("{result}");
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT, true);
    println!("{result}");
    assert_eq!(result, 24);
}
#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT, false);
    println!("{result}");
    assert!(result > 302478109);
    assert!(result < 4693551560);
}

fn main() {
    // part1::execute_part1(EXAMPLE_INPUT);
    // part1::execute_part1(INPUT);
    let result = part1::execute_part2(INPUT, false);
    println!("result {}", result);
}
