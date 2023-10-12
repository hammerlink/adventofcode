use crate::engine::grid_engine::Location;

pub struct Sensor {
    pub location: Location,
    pub closest_beacon: Location,
    pub distance_q: u64,
}

impl Sensor {
    pub fn new(sensor: Location, beacon: Location) -> Sensor {
        let delta_x = (sensor.x - beacon.x).abs() as u64;
        let delta_y = (sensor.y - beacon.y).abs() as u64;

        Sensor {
            location: sensor,
            closest_beacon: beacon,
            distance_q: delta_y + delta_x,
        }
    }
    pub fn can_be_beacon(&self, x: isize, y: isize) -> bool {
        if self.closest_beacon.x == x && self.closest_beacon.y == y {
            return true;
        }
        let distance_q =
            (self.location.x - x).abs() as u64 + (self.location.y - y as isize).abs() as u64;
        distance_q > self.distance_q
    }
}

#[test]
fn can_be_beacon() {
    let sensor = Sensor::new(Location { x: 8, y: 7 }, Location { x: 2, y: 10 });
    assert_eq!(sensor.can_be_beacon(-2, 7), true);
    assert_eq!(sensor.can_be_beacon(-1, 7), false);
    assert_eq!(sensor.can_be_beacon(0, 7), false);
    assert_eq!(sensor.can_be_beacon(-2, 8), true);
    assert_eq!(sensor.can_be_beacon(-1, 8), true);
    assert_eq!(sensor.can_be_beacon(0, 8), false);
    assert_eq!(sensor.can_be_beacon(8, -2), false);
    assert_eq!(sensor.can_be_beacon(8, -3), true);
}
