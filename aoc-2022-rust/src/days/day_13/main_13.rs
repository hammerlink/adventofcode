use crate::days::day_13::signal_value::SignalProcessing;

use super::{
    input_parser::{parse_day_13_input, parse_input_part_2},
    signal_value::{compare_signal_pair, SignalValue},
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
    list.push(SignalValue::Array(vec![SignalValue::Array(vec![
        SignalValue::Number(2),
    ])]));
    list.push(SignalValue::Array(vec![SignalValue::Array(vec![
        SignalValue::Number(6),
    ])]));
    list.sort_by(|left, right| compare_signal_pair(left, right));
    let mut index_2: Option<usize> = None;
    let mut index_6: Option<usize> = None;
    for (i, ele) in list.into_iter().enumerate() {
        if !ele.is_num_value() {
            let list_1 = ele.borrow_list().unwrap();
            if list_1.len() != 1 || list_1[0].is_num_value() {
                continue;
            }
            let list_2 = list_1[0].borrow_list().unwrap();
            if list_2.len() != 1 || !list_2[0].is_num_value() {
                continue;
            }
            let value = list_2[0].to_value().unwrap();
            if value == 2 {
                index_2 = Some(i + 1);
            }
            if value == 6 {
                index_6 = Some(i + 1);
            }
        }
    }
    index_2.unwrap() * index_6.unwrap()
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
    assert!(result < 5545, "too many trues, more cases should fail");
    assert!(result > 3000, "guess attempt, should be higher then 3000");
    assert!(result > 4500, "guess attempt, should be higher then 3000");
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
