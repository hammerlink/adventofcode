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

pub const DOWN_LEFT: Direction = Direction {
    x: -1,
    y: 1,
    visualization: '/',
};
pub const DOWN_RIGHT: Direction = Direction {
    x: 1,
    y: 1,
    visualization: '\\',
};
pub const UP_RIGHT: Direction = Direction {
    x: 1,
    y: -1,
    visualization: '/',
};
pub const UP_LEFT: Direction = Direction {
    x: -1,
    y: -1,
    visualization: '\\',
};
pub const ALL_DIRECTIONS: [Direction; 8] = [
    UP, UP_RIGHT, RIGHT, DOWN_RIGHT, DOWN, DOWN_LEFT, LEFT, UP_LEFT,
];
