const EXAMPLE_INPUT: &str = include_str!("./y2025_day08.example");
const INPUT: &str = include_str!("./y2025_day08.input");

mod part1 {
    use std::{
        cell::RefCell,
        collections::{HashMap, HashSet},
    };

    pub struct JunctionBox {
        pub x: usize,
        pub y: usize,
        pub z: usize,
        pub key: String, // original string
        pub distances: RefCell<HashMap<String, f64>>,
        pub connections: RefCell<Vec<String>>,
    }
    impl JunctionBox {
        fn new(line: &str) -> Self {
            let pieces: Vec<&str> = line.split(",").collect();
            assert_eq!(pieces.len(), 3);

            JunctionBox {
                x: pieces.get(0).unwrap().parse().unwrap(),
                y: pieces.get(1).unwrap().parse().unwrap(),
                z: pieces.get(2).unwrap().parse().unwrap(),
                key: line.to_string(),
                distances: HashMap::new().into(),
                connections: vec![].into(),
            }
        }

        fn calculate_distance(&self, other: &JunctionBox) -> f64 {
            let dx = self.x as f64 - other.x as f64;
            let dy = self.y as f64 - other.y as f64;
            let dz = self.z as f64 - other.z as f64;
            (dx * dx + dy * dy + dz * dz).sqrt()
        }

        fn get_distance(&self, other: &JunctionBox) -> f64 {
            if let Some(distance) = self.distances.borrow().get(&other.key) {
                return *distance;
            }
            let distance = self.calculate_distance(other);
            self.distances
                .borrow_mut()
                .insert(other.key.clone(), distance);
            other
                .distances
                .borrow_mut()
                .insert(self.key.clone(), distance);
            distance
        }
    }
    pub type Boxes = HashMap<String, JunctionBox>;
    fn get_distances(boxes: &Boxes) -> Vec<Distance> {
        let mut output = vec![];

        for from in boxes.values() {
            for other in boxes.values() {
                if from.key == other.key || from.distances.borrow().contains_key(&other.key) {
                    continue;
                }
                let distance = Distance {
                    distance: from.get_distance(other),
                    box_1_key: from.key.clone(),
                    box_2_key: other.key.clone(),
                };
                output.push(distance)
            }
        }

        output
    }
    struct Distance {
        distance: f64,
        box_1_key: String,
        box_2_key: String,
    }

    fn get_circuit(circuit: &RefCell<HashSet<String>>, junction_box: &JunctionBox, boxes: &Boxes) {
        for connected_box_key in junction_box.connections.borrow().iter() {
            if circuit.borrow().contains(connected_box_key) {
                continue;
            }
            circuit.borrow_mut().insert(connected_box_key.clone());
            get_circuit(circuit, boxes.get(connected_box_key).unwrap(), boxes);
        }
    }

    pub fn execute_part1(input: &str, connections: usize) -> usize {
        let junction_boxes: Vec<JunctionBox> = input.lines().map(JunctionBox::new).collect();
        let boxes: Boxes = junction_boxes
            .into_iter()
            .map(|junction_box| (junction_box.key.clone(), junction_box))
            .collect();
        let mut distances = get_distances(&boxes);
        distances.sort_by(|a, b| a.distance.total_cmp(&b.distance));

        for i in 0..connections {
            let distance = distances.get(i).unwrap();
            boxes
                .get(&distance.box_1_key)
                .unwrap()
                .connections
                .borrow_mut()
                .push(distance.box_2_key.clone());
            boxes
                .get(&distance.box_2_key)
                .unwrap()
                .connections
                .borrow_mut()
                .push(distance.box_1_key.clone());
        }

        let mut has_circuit: HashSet<String> = HashSet::new();
        let mut circuits: Vec<HashSet<String>> = vec![];
        // count connections
        for b in boxes.values() {
            if has_circuit.contains(&b.key) || b.connections.borrow().is_empty() {
                continue;
            }

            let circuit: RefCell<HashSet<String>> = HashSet::new().into();
            circuit.borrow_mut().insert(b.key.clone());
            get_circuit(&circuit, b, &boxes);
            circuit.borrow().iter().for_each(|key| {
                has_circuit.insert(key.clone());
            });
            circuits.push(circuit.take());
        }

        circuits.sort_by_key(|b| std::cmp::Reverse(b.len()));

        circuits
            .iter()
            .take(3)
            .map(|c| c.len())
            .reduce(|acc, e| acc * e)
            .unwrap()
    }

    struct SingleCircuit {
        all: HashSet<String>,
        connected: HashSet<String>,
        residu: Vec<(String, String)>,
    }

    impl SingleCircuit {
        pub fn new() -> Self {
            SingleCircuit {
                all: HashSet::new(),
                connected: HashSet::new(),
                residu: vec![],
            }
        }

        pub fn add(&mut self, new: String, other: Option<String>) {
            self.all.insert(new.clone());
            if let Some(other) = other {
                if self.connected.contains(&other) {
                    self.connected.insert(new);
                } else {
                    self.residu.push((new, other.clone()));
                }
            } else {
                self.connected.insert(new);
            }
        }

        pub fn try_clean_residu(&mut self) -> bool {
            let mut to_remove = Vec::new();
            for (new, other) in self.residu.iter() {
                if self.connected.contains(other) {
                    self.connected.insert(new.clone());
                    to_remove.push(new.clone());
                }
            }
            let has_added = !to_remove.is_empty();
            for key in to_remove {
                self.residu.retain(|(new, _)| new != &key);
            }
            has_added
        }
    }

    pub fn execute_part2(input: &str) -> usize {
        let junction_boxes: Vec<JunctionBox> = input.lines().map(JunctionBox::new).collect();
        let boxes: Boxes = junction_boxes
            .into_iter()
            .map(|junction_box| (junction_box.key.clone(), junction_box))
            .collect();
        let mut distances = get_distances(&boxes);
        distances.sort_by(|a, b| a.distance.total_cmp(&b.distance));
        let mut single_circuit = SingleCircuit::new();

        let first = distances.first().unwrap();
        single_circuit.add(first.box_1_key.clone(), None);
        single_circuit.add(first.box_2_key.clone(), None);

        for d in distances.iter().skip(1) {
            single_circuit.add(d.box_1_key.clone(), Some(d.box_2_key.clone()));
            single_circuit.add(d.box_2_key.clone(), Some(d.box_1_key.clone()));
            loop {
                if !single_circuit.try_clean_residu() {
                    break;
                }
            }
            if single_circuit.connected.len() == boxes.len() {
                return boxes.get(&d.box_1_key).unwrap().x * boxes.get(&d.box_2_key).unwrap().x;
            }
        }

        0
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT, 10);
    println!("{result}");
    assert_eq!(result, 40);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT, 1000);
    println!("{result}");
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 25272);
}
#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
    assert!(result > 17001512);
}

fn main() {
    part1::execute_part1(EXAMPLE_INPUT, 10);
    part1::execute_part1(INPUT, 1000);
    part1::execute_part2(EXAMPLE_INPUT);
}
