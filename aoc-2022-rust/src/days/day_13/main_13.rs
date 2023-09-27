use crate::days::day_13::signal_value::SignalProcessing;

use super::{
    input_parser::{parse_day_13_input, parse_input_part_2},
    signal_value::{compare_signal_pair, SignalValue},
};


#[allow(dead_code)]
// Why do you return an isize here? Can it become smaller than 0?
fn part_1(input: &str) -> isize {
    let pairs = parse_day_13_input(input);
    let mut counter: isize = 0;
    for (i, pair) in pairs.iter().enumerate() {
        if pair.is_correct_order() {
            // In theory, casting from usize to isize could be dangerous, since a usize value can become bigger than an isize value
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
    list.sort_by(compare_signal_pair);
    let mut index_2: Option<usize> = None;
    let mut index_6: Option<usize> = None;
    for (i, ele) in list.into_iter().enumerate() {
        if !ele.is_num_value() {
            let list_1 = ele.borrow_list().unwrap();

            // Unnecessary repetition, makes this less readable
            if list_1.len() != 1 || list_1[0].is_num_value() {
                continue;
            }

            // Unwrap doesn't seem necessary; why not returning an empty list in borrow_list?
            let list_2 = list_1[0].borrow_list().unwrap();
            if list_2.len() != 1 || !list_2[0].is_num_value() {
                continue;
            }
            // Unwrap doesn't seem necessary; it can be easily replaced by a match statement
            let value = list_2[0].to_value().unwrap();
            // Unnecessary repition
            if value == 2 {
                index_2 = Some(i + 1);
            }
            if value == 6 {
                index_6 = Some(i + 1);
            }
        }
    }

    // This is not necessary; why not initializing index_2 and index_6 as 0 or 1?
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
    // I would put a more specific assert message (I would include the amount of "trues" in the
    // message below for example)
    assert!(result < 5545, "too many trues, more cases should fail");
    assert!(result > 3000, "guess attempt, should be higher then 3000");
    assert!(result > 4500, "guess attempt, should be higher then 3000");

    // The first 3 asserts seem unnecessary with this one
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
