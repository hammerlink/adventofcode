#[allow(unused)]
const EXAMPLE_INPUT: &str = include_str!("./y2025_day11.example");
const INPUT: &str = include_str!("./y2025_day11.input");

mod part1 {
    use std::collections::{HashMap, HashSet};

    const YOU: &str = "you";
    const OUT: &str = "out";

    struct ServerRack {
        id: String,
        connections: HashSet<String>, // TODO not all connections are here yet
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
    assert_eq!(result, 539);
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
