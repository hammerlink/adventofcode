use super::input_parser::parse_day_13_input;

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
fn part_2(_input: &str) -> isize {
    0
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
    assert_eq!(part_2(input), 29);
}
#[test]
fn day_12_part_2() {
    let input = include_str!("input");
    println!("{}", part_2(input));
}
