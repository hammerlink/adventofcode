#[allow(unused)]
const EXAMPLE_INPUT: &str = include_str!("./y2025_day11.example");
const EXAMPLE_INPUT2: &str = include_str!("./y2025_day11.example2");
const INPUT: &str = include_str!("./y2025_day11.input");

mod part1 {
    use std::{
        cell::RefCell,
        collections::{HashMap, HashSet},
    };

    const YOU: &str = "you";
    const OUT: &str = "out";
    const SVR: &str = "svr";
    const FFT: &str = "fft";
    const DAC: &str = "dac";

    struct ServerRack {
        id: String,
        connections: HashSet<String>, // TODO not all connections are here yet
        has_none_stored_count: RefCell<Option<usize>>,
        has_fft_stored_count: RefCell<Option<usize>>,
        has_dac_stored_count: RefCell<Option<usize>>,
        has_both_stored_count: RefCell<Option<usize>>,
    }

    impl ServerRack {
        fn new(input: &str) -> Self {
            let (id, connections_str) =
                input.split_once(": ").expect("invalid format ': ' missing");
            let connections: HashSet<String> = connections_str
                .split_whitespace()
                .map(|s| s.to_string())
                .collect();

            ServerRack {
                id: id.to_string(),
                connections,
                has_none_stored_count: None.into(),
                has_fft_stored_count: None.into(),
                has_dac_stored_count: None.into(),
                has_both_stored_count: None.into(),
            }
        }
        fn count_out_distances(&self, map: &HashMap<String, ServerRack>) -> usize {
            if self.id == OUT {
                panic!("should not get here");
            }
            let mut count = 0;

            for connection_id in self.connections.iter() {
                if connection_id == OUT {
                    count += 1;
                } else if let Some(connection) = map.get(connection_id) {
                    count += connection.count_out_distances(map);
                }
            }

            count
        }

        fn get_stored_count(&self, has_fft: bool, has_dac: bool) -> Option<usize> {
            if !has_fft && !has_dac {
                *self.has_none_stored_count.borrow()
            } else if has_dac && !has_fft {
                *self.has_dac_stored_count.borrow()
            } else if has_fft && !has_dac {
                *self.has_fft_stored_count.borrow()
            } else {
                *self.has_both_stored_count.borrow()
            }
        }

        fn store_count(&self, has_fft: bool, has_dac: bool, value: usize) {
            if !has_fft && !has_dac {
                *self.has_none_stored_count.borrow_mut() = Some(value);
            } else if has_dac && !has_fft {
                *self.has_dac_stored_count.borrow_mut() = Some(value);
            } else if has_fft && !has_dac {
                *self.has_fft_stored_count.borrow_mut() = Some(value);
            } else {
                *self.has_both_stored_count.borrow_mut() = Some(value);
            }
        }

        fn count_out_distances_with_tracking(
            &self,
            map: &HashMap<String, ServerRack>,
            has_fft: bool,
            has_dac: bool,
        ) -> usize {
            if self.id == OUT {
                panic!("should not get here");
            }
            let mut count = 0;

            for connection_id in self.connections.iter() {
                if connection_id == OUT {
                    if has_fft && has_dac {
                        count += 1;
                    }
                } else if let Some(connection) = map.get(connection_id) {
                    let has_fft = has_fft || connection_id == FFT;
                    let has_dac = has_dac || connection_id == DAC;
                    if let Some(cached_count) = connection.get_stored_count(has_fft, has_dac) {
                        count += cached_count;
                    } else {
                        let connection_count =
                            connection.count_out_distances_with_tracking(map, has_fft, has_dac);
                        connection.store_count(has_fft, has_dac, connection_count);
                        count += connection_count;
                    }
                }
            }

            count
        }
    }

    #[allow(unused)]
    pub fn execute_part1(input: &str) -> usize {
        let server_racks = input.lines().map(ServerRack::new);
        let server_rack_map: HashMap<String, ServerRack> = server_racks
            .map(|server_rack| (server_rack.id.clone(), server_rack))
            .collect();
        let start = server_rack_map.get(YOU).expect("you to be found");
        start.count_out_distances(&server_rack_map)
    }

    #[allow(unused)]
    pub fn execute_part2(input: &str) -> usize {
        let server_racks = input.lines().map(ServerRack::new);
        let server_rack_map: HashMap<String, ServerRack> = server_racks
            .map(|server_rack| (server_rack.id.clone(), server_rack))
            .collect();
        let start = server_rack_map.get(SVR).expect("srv to be found");
        start.count_out_distances_with_tracking(&server_rack_map, false, false)
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 5);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT);
    println!("{result}");
    assert_eq!(result, 539);
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT2);
    println!("{result}");
    assert_eq!(result, 2);
}
#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
}

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
    part1::execute_part2(EXAMPLE_INPUT2);
    let result = part1::execute_part2(INPUT);
    println!("result {}", result);
}
