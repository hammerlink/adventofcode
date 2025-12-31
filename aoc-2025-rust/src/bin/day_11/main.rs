#[allow(unused)]
const EXAMPLE_INPUT: &str = include_str!("./y2025_day11.example");
const INPUT: &str = include_str!("./y2025_day11.input");

mod part1 {
    use std::{
        cell::RefCell,
        collections::{HashMap, HashSet},
    };

    const YOU: &str = "you";
    const OUT: &str = "out";

    struct ServerRack {
        id: String,
        connections: HashSet<String>, // TODO not all connections are here yet
        out_distance: RefCell<Option<usize>>,
        out_calculation_triggered: RefCell<bool>,
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
                out_distance: None.into(),
                out_calculation_triggered: false.into(),
            }
        }
        fn calculate_out_distance(&self, map: &HashMap<String, ServerRack>) -> Option<usize> {
            if self.id == OUT {
                return Some(0);
            }
            if *self.out_calculation_triggered.borrow() {
                return *self.out_distance.borrow(); // not entirely sure about this, potential paths missed?
            }
            // check if is out
            *self.out_calculation_triggered.borrow_mut() = true;

            for connection_id in self.connections.iter() {
                println!("id: {} -> connection {}", self.id, connection_id);
                if connection_id == OUT {
                    *self.out_distance.borrow_mut() = Some(1);
                    break;
                } else if let Some(connection) = map.get(connection_id)
                    && let Some(distance) = connection.calculate_out_distance(map)
                {
                    let out_distance = *self.out_distance.borrow();
                    if out_distance.is_none() || distance < out_distance.unwrap() {
                        *self.out_distance.borrow_mut() = Some(distance + 1);
                        println!(
                            "id: {} -> connection {}: distance: {}",
                            self.id,
                            connection_id,
                            distance + 1,
                        );
                    }
                }
                println!("id: {} -> connection {} finished", self.id, connection_id);
            }

            println!(
                "id: {} distance: {}",
                self.id,
                self.out_distance.borrow().unwrap_or(100)
            );
            *self.out_distance.borrow()
        }
    }

    #[allow(unused)]
    pub fn execute_part1(input: &str) -> usize {
        let server_racks = input.lines().map(ServerRack::new);
        let server_rack_map: HashMap<String, ServerRack> = server_racks
            .map(|server_rack| (server_rack.id.clone(), server_rack))
            .collect();
        let start = server_rack_map.get(YOU).expect("you to be found");
        start.calculate_out_distance(&server_rack_map).unwrap()
    }

    #[allow(unused)]
    pub fn execute_part2(input: &str) -> usize {
        0
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
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
}
#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
}

fn main() {
    // part1::execute_part1(EXAMPLE_INPUT);
    // part1::execute_part1(INPUT);
    let result = part1::execute_part2(INPUT);
    println!("result {}", result);
}
