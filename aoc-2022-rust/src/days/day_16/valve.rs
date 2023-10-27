use std::collections::HashMap;

use fxhash::FxHashMap;
use lazy_static::lazy_static;
use regex::Regex;

#[derive(Clone)]
pub struct ValveRoute<'a> {
    pub id: &'a str,
    pub steps_required: usize,
}

pub struct Valve {
    pub id: String,
    pub flow_rate: usize,
    pub direct_target_ids: Vec<String>,
    // pub valve_steps: HashMap<String, usize>,
    pub valve_steps: FxHashMap<String, usize>,
}

lazy_static! {
    static ref VALVE_REGEX: Regex =
        Regex::new(r"Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)$").unwrap();
}
impl Valve {
    pub fn new(input: &str) -> Self {
        let valve_matches = VALVE_REGEX.captures(input).unwrap();
        let id = valve_matches
            .get(1)
            .map(|m| m.as_str())
            .unwrap()
            .to_string();
        let flow_rate =
            usize::from_str_radix(valve_matches.get(2).map(|m| m.as_str()).unwrap(), 10).unwrap();
        let direct_target_ids: Vec<String> = valve_matches
            .get(3)
            .map(|m| m.as_str())
            .unwrap()
            .split(", ")
            .map(|v| v.to_string())
            .collect();
        let mut valve_steps: FxHashMap<String, usize> = FxHashMap::default();
        direct_target_ids.iter().for_each(|id| {
            valve_steps.insert(id.clone(), 1);
        });
        Valve {
            id,
            flow_rate,
            direct_target_ids,
            valve_steps,
        }
    }
}

pub struct ValveIteration2<'a> {
    pub current_valve_1: &'a Valve,
    pub current_valve_2: &'a Valve,
    pub open_valve_ids: Vec<String>,
    pub step_counter_1: usize,
    pub step_counter_2: usize,
    pub pressure_release: usize,
    pub max_steps: usize,
}

pub type ValveMap = HashMap<String, Valve>;
pub trait ValveMapTrait {
    fn new(valves: Vec<Valve>) -> Self;
    fn determine_valve_steps(&mut self);
    fn cleanup_useless_valves(&mut self);
}
impl ValveMapTrait for ValveMap {
    fn determine_valve_steps(&mut self) {
        loop {
            let mut triggered = false;
            let ids: Vec<String> = self.keys().map(|id| id.clone()).collect();

            ids.iter().for_each(|id| {
                let mut valve_step_updates: Vec<(String, usize)> = vec![];
                {
                    let valve_borrow = self.get(id).unwrap();

                    for (direct_id, direct_valve_steps) in valve_borrow.valve_steps.iter() {
                        let direct_valve = self.get(direct_id).unwrap();
                        for (next_id, next_valve_steps) in direct_valve.valve_steps.iter() {
                            if next_id == id {
                                continue;
                            }
                            let total_steps = direct_valve_steps + next_valve_steps;
                            let valve_to_direct_steps = valve_borrow.valve_steps.get(next_id);
                            if valve_to_direct_steps.is_none()
                                || valve_to_direct_steps.unwrap() > &total_steps
                            {
                                triggered = true;
                                valve_step_updates.push((next_id.clone(), total_steps));
                            }
                        }
                    }
                }

                let valve = self.get_mut(id).unwrap();
                valve_step_updates.into_iter().for_each(|(id, steps)| {
                    valve.valve_steps.insert(id, steps);
                });
            });
            let _result = self.get_mut(&String::from("AA"));
            if !triggered {
                break;
            }
        }
    }

    fn new<'a>(valves: Vec<Valve>) -> Self {
        let mut valve_map: HashMap<String, Valve> = HashMap::new();
        valves.into_iter().for_each(|v| {
            valve_map.insert(v.id.clone(), v);
        });
        valve_map.determine_valve_steps();
        valve_map.cleanup_useless_valves();
        return valve_map;
    }

    fn cleanup_useless_valves(&mut self) {
        let useless_valves: Vec<String> = self
            .values()
            .filter(|v| v.id != "AA" && v.flow_rate == 0)
            .map(|v| v.id.clone())
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

#[test]
fn hashmap_string_test() {
    let a: String = String::from("A");
    let a1: String = String::from("A");
    assert_eq!(a, a1);
    assert!(a == a1);
    let mut h: HashMap<String, bool> = HashMap::new();
    h.insert(a, true);
    let r = h.get(&a1);
    assert!(r.is_some());
}
