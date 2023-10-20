use std::collections::HashMap;

use lazy_static::lazy_static;
use regex::Regex;

#[derive(Clone)]
pub struct ValveRoute<'a> {
    pub id: &'a str,
    pub steps_required: usize,
}

#[derive(Clone)]
pub struct Valve<'a> {
    pub id: &'a str,
    pub flow_rate: usize,
    pub direct_target_ids: Vec<&'a str>,
    // pub valve_steps: HashMap<&'a str, usize>,
}

lazy_static! {
    static ref VALVE_REGEX: Regex =
        Regex::new(r"Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)$").unwrap();
}
impl Valve<'_> {
    pub fn new(input: &str) -> Self {
        let valve_matches = VALVE_REGEX.captures(input).unwrap();
        let id = &valve_matches[1];
        let flow_rate = usize::from_str_radix(&valve_matches[2], 10).unwrap();
        let direct_target_ids: Vec<&str> = valve_matches[3].split(", ").collect();
        let mut valve_steps: HashMap<&str, usize> = HashMap::new();
        direct_target_ids.iter().for_each(|id| {
            valve_steps.insert(id.clone(), 1);
        });
        Valve {
            id,
            flow_rate,
            direct_target_ids,
            // valve_steps,
        }
    }
}

pub type ValveMap<'a> = HashMap<&'a str, Valve<'a>>;
pub trait ValveMapTrait {
    fn new(valves: Vec<Valve>) -> Self;
    fn determine_valve_steps(&mut self);
    fn cleanup_useless_valves(&mut self);
}
impl ValveMapTrait for ValveMap<'_> {
    fn determine_valve_steps(&mut self) {
        loop {
            let mut triggered = false;
            self.keys().for_each(|id| {
                let valve = self.get_mut(id).unwrap();
                for (direct_id, direct_valve_steps) in valve.valve_steps.iter() {
                    let direct_valve = &self[direct_id];
                    for (next_id, next_valve_steps) in direct_valve.valve_steps.iter() {
                        if next_id == id {
                            continue;
                        }
                        let total_steps = direct_valve_steps + next_valve_steps;
                        let valve_to_direct_steps = valve.valve_steps.get(next_id);
                        if valve_to_direct_steps.is_none()
                            || valve_to_direct_steps.unwrap() > &total_steps
                        {
                            triggered = true;
                            valve.valve_steps.insert(next_id, total_steps);
                        }
                    }
                }
            });
            if !triggered {
                break;
            }
        }
    }

    fn new(valves: Vec<Valve>) -> Self {
        let mut valve_map: HashMap<&str, Valve> = HashMap::new();
        valves.into_iter().for_each(|v| {
            valve_map.insert(v.id, v);
        });
        valve_map.determine_valve_steps();
        valve_map.cleanup_useless_valves();
        return valve_map;
    }

    fn cleanup_useless_valves(&mut self) {
        let useless_valves: Vec<&str> = self
            .values()
            .filter(|v| v.id == "AA" || v.flow_rate > 0)
            .map(|v| v.id)
            .collect();
        useless_valves.iter().for_each(|id| {
            self.remove(id);
        });
        self.values_mut().for_each(|valve| {
            useless_valves.iter().for_each(|id| {
                valve.valve_steps.remove(id);
            })
        });
    }
}
