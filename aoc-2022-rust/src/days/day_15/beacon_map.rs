use crate::engine::grid::grid::Grid;

use super::sensor::Sensor;

pub struct BeaconMapCell {
    is_sensor: bool,
    is_beacon: bool,
}

pub type BeaconMap = Grid<BeaconMapCell>;

impl BeaconMap {
    pub fn new_beacon_map(sensors: &Vec<Sensor>) -> Self {
        let mut map = BeaconMap::new(None);
        for sensor in sensors {
            // create if it does not exist
            // borrow mut & update the values
            map.update_cell(
                sensor.location.x,
                sensor.location.y,
                BeaconMapCell {
                    is_sensor: true,
                    is_beacon: false,
                },
            );
        }
        map
    }
    pub fn beacon_map_print(&self) {
        self.print(|cell_raw| match cell_raw {
            Some(cell) => {
                if cell.is_sensor {
                    return "S".to_string();
                }
                if cell.is_beacon {
                    return "B".to_string();
                }
                return ".".to_string();
            }
            None => ".".to_string(),
        });
    }
}
