use regex::Regex;

use crate::engine::grid_engine::Location;

use super::sensor::Sensor;

fn parse_line(input: &str) -> Sensor {
    let re =
        Regex::new(r"Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)")
            .unwrap();
    let regex_match = re.captures(input).unwrap();
    let location_1 = Location {
        x: isize::from_str_radix(&regex_match[1], 10).unwrap(),
        y: isize::from_str_radix(&regex_match[2], 10).unwrap(),
    };
    let location_2 = Location {
        x: isize::from_str_radix(&regex_match[3], 10).unwrap(),
        y: isize::from_str_radix(&regex_match[4], 10).unwrap(),
    };
    Sensor::new(location_1, location_2)
}
#[test]
fn parse_line_example() {
    // let Sensor {
    //     location,
    //     closest_beacon,
    // } = parse_line("Sensor at x=-14, y=17: closest beacon is at x=10, y=-16");
    // assert!(location.x == -14);
    // assert!(location.y == 17);
    // assert!(closest_beacon.x == 10);
    // assert!(closest_beacon.y == -16);
}

fn parse_input(input: &str) -> Vec<Sensor> {
    input
        .lines()
        .filter(|line| !line.is_empty())
        .map(parse_line)
        .collect()
}

fn get_x_boundaries(sensors: &Vec<Sensor>) -> (isize, isize) {
    let mut min: isize = 0;
    let mut max: isize = 0;
    for sensor in sensors {
        if sensor.location.x < min {
            min = sensor.location.x;
        }
        if sensor.closest_beacon.x < min {
            min = sensor.closest_beacon.x;
        }
        if sensor.location.x > max {
            max = sensor.location.x;
        }
        if sensor.closest_beacon.x > max {
            max = sensor.closest_beacon.x;
        }
    }
    return (min, max);
}

fn count_impossible_fields(sensors: &Vec<Sensor>, y: u32, min_x: isize, max_x: isize) -> usize {
    let mut count: usize = 0;
    for x in min_x..=max_x {
        let mut possible = true;
        for sensor in sensors {
            if !sensor.can_be_beacon(x, y as isize) {
                possible = false;
                break;
            }
        }
        if !possible {
            count += 1;
        }
    }
    count
}

#[allow(dead_code)]
fn part_1(input: &str, row_line: u32) -> usize {
    let sensors = parse_input(input);
    let x_boundaries = get_x_boundaries(&sensors);
    let min_x = x_boundaries.0;
    let max_x = x_boundaries.1;
    count_impossible_fields(&sensors, row_line, min_x * 2, max_x * 2)
}
#[allow(dead_code)]
fn part_2(input: &str) -> usize {
    let _sensors = parse_input(input);
    0
}

#[test]
fn day_12_part_1_example() {
    let raw_input_example = include_str!("input.example");
    let result = part_1(raw_input_example, 10);
    println!("{}", result);
    assert_eq!(result, 26);
}
#[test]
fn day_12_part_1() {
    let input = include_str!("input");
    let result = part_1(input, 2000000);
    println!("{}", result);
    assert!(result > 4096105);
}
#[test]
fn day_12_part_2_example() {
    let input = include_str!("input.example");
    assert_eq!(part_2(input), 93);
}
#[test]
fn day_12_part_2() {
    let input = include_str!("input");
    println!("{}", part_2(input));
    assert_eq!(part_2(input), 20870);
}
