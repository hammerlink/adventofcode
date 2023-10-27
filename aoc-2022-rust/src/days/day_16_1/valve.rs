use std::borrow::BorrowMut;

use fxhash::FxHashMap;
use itertools::Itertools;
use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref VALVE_REGEX: Regex =
        Regex::new(r"Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)$").unwrap();
}
pub struct Valve<'a> {
    pub id: &'a str,
    pub flow_rate: usize,
    pub valve_steps: FxHashMap<&'a str, usize>,
}

pub type RawValve = (String, usize, Vec<String>);
pub fn get_raw_valve(line: &str) -> RawValve {
    let valve_matches = VALVE_REGEX.captures(line).unwrap();
    let valve_id = valve_matches
        .get(1)
        .map(|m| m.as_str())
        .unwrap()
        .to_string();

    let flow_rate =
        usize::from_str_radix(valve_matches.get(2).map(|m| m.as_str()).unwrap(), 10).unwrap();
    let target_ids = valve_matches
        .get(3)
        .map(|m| m.as_str())
        .unwrap()
        .split(", ")
        .map(|v| v.to_string())
        .collect();
    (valve_id, flow_rate, target_ids)
}
pub fn parse_raw_valves<'a>(raw_valves: &'a Vec<RawValve>) -> Vec<Valve<'a>> {
    let mut valves: Vec<Valve<'a>> = vec![];
    // build all valves
    for i in 0..raw_valves.len() {
        let (valve_id, flow_rate, _target_ids) = &raw_valves[i];
        valves.push(Valve {
            id: &valve_id,
            flow_rate: flow_rate.clone(),
            valve_steps: FxHashMap::default(),
        });
    }
    // fill all direct valve connections
    for i in 0..raw_valves.len() {
        let (_, _, target_ids) = &raw_valves[i];
        let valve = valves[i].borrow_mut();
        target_ids.iter().for_each(|target_id| {
            valve.valve_steps.insert(target_id.as_str(), 1);
            // TODO IF POSSIBLE ADD REFERENCE TO THE VALVE HERE, HAVING ISSUES WITH LIFETIME
        })
    }
    // connect all valves with each other
    loop {
        let mut triggered = false;
        // keep iterating until no new connections have been found
        for i in 0..valves.len() {
            let mut valve_step_updates: Vec<(usize, usize)> = vec![];
            for (target_id, direct_valve_steps) in valves[i].valve_steps.iter() {
                let (target_index, _) = raw_valves
                    .iter()
                    .find_position(|(id, _, _)| id == target_id)
                    .unwrap();
                if target_index == i {
                    continue;
                }
                // iterate all other connections of connected valve, add any unknowns
                let direct_valve = &valves[target_index];
                for (next_id, next_valve_steps) in direct_valve.valve_steps.iter() {
                    let (next_index, _) = raw_valves
                        .iter()
                        .find_position(|(id, _, _)| id == next_id)
                        .unwrap();
                    if next_index == i {
                        continue;
                    }
                    let total_steps = direct_valve_steps + next_valve_steps;
                    let valve_to_direct_steps = valves[i].valve_steps.get(next_id);
                    if valve_to_direct_steps.is_none()
                        || valve_to_direct_steps.unwrap() > &total_steps
                    {
                        triggered = true;
                        valve_step_updates.push((next_index, total_steps));
                    }
                }
            }

            // add all new valves
            let valve = valves[i].borrow_mut();
            valve_step_updates.into_iter().for_each(|(index, steps)| {
                valve.valve_steps.insert(&raw_valves[index].0, steps);
            });
        }
        if !triggered {
            break;
        }
    }
    // clean up all unused valves
    let useless_valves: Vec<String> = valves
        .iter()
        .filter(|v| v.id != "AA" && v.flow_rate == 0)
        .map(|v| v.id.to_string())
        .collect();
    valves.iter_mut().for_each(|valve| {
        useless_valves.iter().for_each(|id| {
            valve.valve_steps.remove(id.as_str());
        })
    });
    valves
        .into_iter()
        .filter(|valve| !useless_valves.contains(&valve.id.to_string()))
        .collect()
}

#[allow(dead_code)]
fn print_valves(valves: &Vec<Valve>) {
    for valve in valves {
        println!("-------------------");
        println!("id: {}", valve.id);
        for (id, steps) in &valve.valve_steps {
            println!("{} -> {} : {}", valve.id, id, steps);
        }
    }
}
struct ValveIteration<'a> {
    current_valve: &'a Valve<'a>,
    open_valve_ids: Vec<&'a str>,
    step_counter: usize,
    pressure_release: usize,
    max_steps: usize,
}
fn iterate_options(valves: &[Valve], iteration: &mut ValveIteration) -> usize {
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
        updated_open_valve_ids.push(valve.id);

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

fn part_1(input: &str) -> usize {
    let lines: Vec<&str> = input.lines().filter(|x| !x.is_empty()).collect();
    let raw_valves: Vec<RawValve> = lines.into_iter().map(|line| get_raw_valve(line)).collect();
    let valves: Vec<Valve> = parse_raw_valves(&raw_valves);
    let start_valve_index = valves.iter().position(|x| x.id == "AA").unwrap();
    let mut valve_iteration = ValveIteration {
        current_valve: &valves[start_valve_index],
        open_valve_ids: vec!["AA"],
        step_counter: 0,
        pressure_release: 0,
        max_steps: 30,
    };
    iterate_options(valves.as_slice(), &mut valve_iteration)
}
#[allow(dead_code)]
fn part_1_example() -> usize {
    let input = include_str!("input.example");
    part_1(input)
}

#[test]
fn test_run() {
    let result = part_1_example();
    println!("{}", result);
}
#[test]
fn day_16_part_1() {
    let input = include_str!("input");
    let result = part_1(input);
    println!("{}", result);
    assert_eq!(result, 1584);
}
