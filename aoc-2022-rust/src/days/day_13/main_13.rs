use crate::days::day_13::signal_value::SignalValue;

use super::{
    input_parser::{parse_day_13_input, parse_input_part_2},
    signal_value::{compare_signal_pair, SignalProcessing},
};

#[allow(dead_code)]
fn part_1(input: &str) -> isize {
    let pairs = parse_day_13_input(input);
    let mut counter: isize = 0;
    for (i, pair) in pairs.iter().enumerate() {
        if pair.is_correct_order() {
            counter += i as isize + 1;
        }
    }
    counter
}
#[allow(dead_code)]
fn part_2(input: &str) -> usize {
    let mut list = parse_input_part_2(input);
    let extra_element_2 =
        SignalValue::Array(vec![SignalValue::Array(vec![SignalValue::Number(2)])]);
    let extra_element_6 =
        SignalValue::Array(vec![SignalValue::Array(vec![SignalValue::Number(6)])]);
    list.push(extra_element_2.clone());
    list.push(extra_element_6.clone());
    list.sort_by(compare_signal_pair);
    let index_2 = list
        .iter()
        .position(|ele| ele.is_equal(&extra_element_2, None))
        .unwrap();
    let index_6 = list
        .iter()
        .position(|ele| ele.is_equal(&extra_element_6, None))
        .unwrap();
    (index_2 + 1) * (index_6 + 1)
}

#[test]
fn day_12_part_1_example() {
    let raw_input_example = include_str!("input.example");
    let result = part_1(raw_input_example);
    assert_eq!(result, 13);
}
#[test]
fn day_12_part_1() {
    let input = include_str!("input");
    let result = part_1(input);
    println!("{}", result);
    assert_eq!(part_1(input), 5198);
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
