#[allow(dead_code)]
pub fn part_1(_input: &str) -> usize {
    0
}
#[allow(dead_code)]
fn part_2(_input: &str) -> usize {
    0
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
