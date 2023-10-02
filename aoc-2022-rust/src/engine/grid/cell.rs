pub struct MapCell<T> {
    pub x: isize,
    pub y: isize,
    pub value: T,
}

pub type GridCell<T> = MapCell<Option<T>>;

impl<T> GridCell<T> {
    pub fn borrow_value(&self) -> Option<&T> {
        self.value.as_ref()
    }
}
