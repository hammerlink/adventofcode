use crate::days::day_16::valve::Valve;

use super::valve::{ValveIteration2, ValveMap, ValveMapTrait};

fn parse_input(input: &str) -> ValveMap {
    let valves: Vec<Valve> = input
        .lines()
        .filter(|line| !line.is_empty())
        .map(|line| Valve::new(line))
        .collect();
    ValveMapTrait::new(valves)
}

struct ValveIteration<'a> {
    current_valve: &'a Valve,
    open_valve_ids: Vec<String>,
    step_counter: usize,
    pressure_release: usize,
    max_steps: usize,
}
fn iterate_options(valves: &[&Valve], iteration: &mut ValveIteration) -> usize {
    let current_valve = iteration.current_valve;
    let open_valve_ids = &iteration.open_valve_ids;
    let step_counter = iteration.step_counter;
    let mut max_pressure = iteration.pressure_release;

    for valve in valves {
        if valve.flow_rate == 0 || open_valve_ids.iter().any(|v| v == &valve.id) {
            continue;
        }

        let required_steps = valve.valve_steps.get(&current_valve.id).unwrap();
        let updated_step_counter = step_counter + required_steps + 1;

        if updated_step_counter > iteration.max_steps {
            continue;
        }

        let extra_pressure_release = (iteration.max_steps - updated_step_counter) * valve.flow_rate;
        let updated_pressure = iteration.pressure_release + extra_pressure_release;
        let mut updated_open_valve_ids = open_valve_ids.clone();
        updated_open_valve_ids.push(valve.id.clone());

        let mut new_iteration = ValveIteration {
            current_valve: valve,
            open_valve_ids: updated_open_valve_ids,
            step_counter: updated_step_counter,
            pressure_release: updated_pressure,
            max_steps: iteration.max_steps,
        };

        let pressure = iterate_options(valves, &mut new_iteration);

        if pressure > max_pressure {
            max_pressure = pressure;
        }
    }

    iteration.pressure_release = max_pressure;
    iteration.pressure_release
}

fn iterate_options_2(valves: Vec<&Valve>, iteration: &mut ValveIteration2) -> usize {
    let mut new_iterations: Vec<ValveIteration2> = vec![];
    for i in 0..valves.len() {
        let valve1 = valves.get(i).unwrap();
        if valve1.flow_rate == 0 || iteration.open_valve_ids.iter().any(|v| v == &valve1.id) {
            continue;
        }
        let required_steps = valve1
            .valve_steps
            .get(&iteration.current_valve_1.id)
            .unwrap();
        let updated_step_counter = iteration.step_counter_1 + required_steps + 1;
        if updated_step_counter > iteration.max_steps {
            continue;
        }
        let extra_pressure_release =
            (iteration.max_steps - updated_step_counter) * valve1.flow_rate;

        let mut counter = 0;
        for j in 0..valves.len() {
            let valve2 = valves.get(j).unwrap();
            if j == i
                || valve2.flow_rate == 0
                || iteration.open_valve_ids.iter().any(|v| v == &valve2.id)
            {
                continue;
            }
            let required_steps = valve2
                .valve_steps
                .get(&iteration.current_valve_2.id)
                .unwrap();
            let updated_step_counter_2 = iteration.step_counter_2 + required_steps + 1;
            if updated_step_counter_2 > iteration.max_steps {
                continue;
            }
            let extra_pressure_release_2 =
                (iteration.max_steps - updated_step_counter_2) * valve2.flow_rate;
            let updated_pressure_2 =
                iteration.pressure_release + extra_pressure_release + extra_pressure_release_2;
            let mut updated_open_ids: Vec<String> = iteration.open_valve_ids.clone();
            updated_open_ids.extend(vec![valve1.id.clone(), valve2.id.clone()]);
            new_iterations.push(ValveIteration2 {
                max_steps: iteration.max_steps,
                current_valve_1: valve1,
                current_valve_2: valve2,
                open_valve_ids: updated_open_ids,
                step_counter_1: updated_step_counter,
                step_counter_2: updated_step_counter_2,
                pressure_release: updated_pressure_2,
            });
            counter = counter + 1;
        }
    }
    for mut new_iteration in new_iterations {
        let pressure = iterate_options_2(valves.clone(), &mut new_iteration);
        if pressure > iteration.pressure_release {
            iteration.pressure_release = pressure;
        }
    }

    iteration.pressure_release
}

#[allow(dead_code)]
pub fn part_1(input: &str) -> usize {
    let valve_map = parse_input(input);
    let mut valve_iteration = ValveIteration {
        current_valve: valve_map.get("AA").unwrap(),
        open_valve_ids: vec!["AA".to_string()],
        step_counter: 0,
        pressure_release: 0,
        max_steps: 30,
    };
    let vec_of_valves: Vec<&Valve> = valve_map.values().collect();
    iterate_options(
        vec_of_valves.as_slice(),
        &mut valve_iteration,
    )
}
#[allow(dead_code)]
fn part_2(input: &str) -> usize {
    let valve_map = parse_input(input);
    // todo!("add AA to open valve ids");
    let start_valve = valve_map.get("AA").unwrap();
    let mut valve_iteration = ValveIteration2 {
        current_valve_1: start_valve,
        current_valve_2: start_valve,
        open_valve_ids: vec!["AA".to_string()],
        step_counter_1: 0,
        step_counter_2: 0,
        pressure_release: 0,
        max_steps: 26,
    };
    // let mut valves: Vec<&Valve> = valve_map.values().collect();
    // valves.sort_by(|a, b| b.flow_rate.cmp(&a.flow_rate));
    // valves.iter().for_each(|v| {
    //     println!("valve id {} flow_rate {}", v.id, v.flow_rate);
    // });
    // iterate_options_2(valves, &mut valve_iteration)
    iterate_options_2(valve_map.values().collect(), &mut valve_iteration)
}

pub fn day_16_part_1_run() {
    let input = include_str!("input");
    let result = part_1(input);
    println!("{}", result);
    assert_eq!(result, 1584);
}
#[allow(dead_code)]
pub fn day_16_part_2_run() {
    let input = include_str!("input");
    let result = part_2(input);
    println!("{}", result);
    assert_eq!(result, 2052); // 42,877 sec in js
}

#[test]
fn day_16_part_1_example() {
    let raw_input_example = include_str!("input.example");
    let result = part_1(raw_input_example);
    println!("{}", result);
    assert_eq!(result, 1651);
}
#[test]
fn day_16_part_1() {
    let input = include_str!("input");
    let result = part_1(input);
    println!("{}", result);
    assert_eq!(result, 1584);
}
#[test]
fn day_16_part_2_example() {
    let input = include_str!("input.example");
    assert_eq!(part_2(input), 1707);
}
#[test]
fn day_16_part_2() {
    let input = include_str!("input");
    let result = part_2(input);
    println!("{}", result);
    assert_eq!(result, 2052); // 42,877 sec in js
}
