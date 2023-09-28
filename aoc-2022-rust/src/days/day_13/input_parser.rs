use serde_json::from_str;

use super::{signal_pair::SignalPair, signal_value::SignalValue};

#[allow(dead_code)]
pub fn parse_day_13_input(input: &str) -> Vec<SignalPair> {
    let signal_lines: Vec<&str> = input.lines().filter(|line| !line.is_empty()).collect();
    signal_lines
        .windows(2)
        .step_by(2)
        .map(|signal_pair| {
            let left_parsed = from_str::<SignalValue>(signal_pair[0]).unwrap();
            let right_parsed = from_str::<SignalValue>(signal_pair[1]).unwrap();
            
            SignalPair {
                left_parsed,
                right_parsed,
            }
        })
        .collect()
}

pub fn parse_input_part_2(input: &str) -> Vec<SignalValue> {
    input
        .lines()
        .filter(|line| !line.is_empty())
        .map(|line| from_str::<SignalValue>(line).unwrap())
        .collect()
}

#[test]
fn day_13_fix_mixed_types() {
    let raw_input_example = include_str!("input.example");
    let result = parse_day_13_input(raw_input_example);
    result.into_iter().for_each(|pair| {
        pair.print();
    });
    // println!("{}", result.len());
    // assert!(result.len() == 8);
}

#[test]
fn day_13_input() {
    let raw_input_example = include_str!("input.example");
    let result = parse_day_13_input(raw_input_example);
    println!("{}", result.len());
    assert!(result.len() == 8);
    assert_eq!(result.get(0).unwrap().is_correct_order(), true);
    assert_eq!(result.get(1).unwrap().is_correct_order(), true);
    assert_eq!(result.get(2).unwrap().is_correct_order(), false);
    assert_eq!(result.get(3).unwrap().is_correct_order(), true);
    assert_eq!(result.get(4).unwrap().is_correct_order(), false);
    assert_eq!(result.get(5).unwrap().is_correct_order(), true);
    assert_eq!(result.get(6).unwrap().is_correct_order(), false);
    assert_eq!(result.get(7).unwrap().is_correct_order(), false);
}
