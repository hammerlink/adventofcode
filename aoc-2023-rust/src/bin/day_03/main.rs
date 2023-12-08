use std::usize;

use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref NUMBER_REGEX: Regex = Regex::new(r"[0-9]+").unwrap();
    static ref SYMBOL_REGEX: Regex = Regex::new(r"[^0-9\.]").unwrap();
}

fn part_1(input: &str) -> usize {
    let mut total = 0;
    let lines: Vec<&str> = input.lines().collect();
    lines.iter().enumerate().for_each(|(line_index, line)| {
        NUMBER_REGEX
            .find_iter(line)
            .map(|mat| (mat.as_str(), mat.start()))
            .for_each(|(raw_value, index)| {
                let mut begin_index = 0;
                if index > 0 {
                    begin_index = index - 1;
                }
                let mut end_index = index + raw_value.len() + 1;
                if end_index >= line.len() {
                    end_index = line.len() - 1;
                }
                let mut slice: String = line[begin_index..end_index].to_string();
                if line_index > 0 {
                    let previous_slice = &lines[line_index - 1][begin_index..end_index];
                    slice += previous_slice;
                }
                if line_index < lines.len() - 1 {
                    let next_slice = &lines[line_index + 1][begin_index..end_index];
                    slice += next_slice;
                }
                if SYMBOL_REGEX.is_match(slice.as_str()) {
                    total += usize::from_str_radix(raw_value, 10).unwrap();
                }
            });
    });
    return total;
}

fn part_2(input: &str) -> usize {
    0
}
#[allow(dead_code)]
fn main() {
    let example_input = include_str!("../../../../src/2023/data/y2023_day03.example");
    let input = include_str!("../../../../src/2023/data/y2023_day03.input");
    println!("part 1 example - start");
    let part_1_example = part_1(example_input);
    assert_eq!(part_1_example, 4361, "example part 1 not correct");
    println!("part 1 - start");
    let part_1_result = part_1(input);
    assert_eq!(part_1_result, 553825, "part 1 not correct");
    println!("part 1 - {}", part_1_result);

    // let part_2_example = part_2(example_input);
    // assert_eq!(part_2_example, 467835, "example part 2 not correct");
    //
    // let part_2_result = part_2(input);
    // assert_eq!(part_2_result, 93994191, "part 2 not correct");
    // println!("part 2 - {}", part_2_result);
}
