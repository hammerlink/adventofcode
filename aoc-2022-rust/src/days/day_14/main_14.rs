use crate::engine::grid_engine::Location;

use super::regolith_reservoir::RegolithReservoir;

fn parse_input(input: &str) -> Vec<Vec<Location>> {
    input
        .lines()
        .filter(|line| !line.is_empty())
        .map(|line| {
            let raw_locations = line.split(" -> ");
            raw_locations
                .map(|raw| {
                    let coordinates: Vec<&str> = raw.split(",").collect();
                    Location {
                        x: isize::from_str_radix(coordinates[0], 10).unwrap(),
                        y: isize::from_str_radix(coordinates[1], 10).unwrap(),
                    }
                })
                .collect()
        })
        .collect()
}

#[allow(dead_code)]
fn part_1(input: &str) -> usize {
    let rock_location_sequences = parse_input(input);
    let mut cave = RegolithReservoir::new();
    for sequence in rock_location_sequences {
        cave.apply_rock_location_sequence(&sequence);
    }
    cave.print();
    let mut sand_counter: usize = 0;
    while cave.drop_sand_grain() {
        sand_counter += 1;
    }
    cave.print();
    sand_counter
}
#[allow(dead_code)]
fn part_2(input: &str) -> usize {
    0
}

#[test]
fn day_12_part_1_example() {
    let raw_input_example = include_str!("input.example");
    let result = part_1(raw_input_example);
    assert_eq!(result, 24);
}
#[test]
fn day_12_part_1() {
    let input = include_str!("input");
    let result = part_1(input);
    println!("{}", result);
    assert_eq!(part_1(input), 1406);
}
#[test]
fn day_12_part_2_example() {
    let input = include_str!("input.example");
    assert_eq!(part_2(input), 140);
}
#[test]
fn day_12_part_2() {
    let input = include_str!("input");
    println!("{}", part_2(input));
    assert_eq!(part_2(input), 22344);
}
