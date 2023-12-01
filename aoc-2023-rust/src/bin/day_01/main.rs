use regex::Regex;
use substring::Substring;

fn part_1(input: &str) -> usize {
    input
        .lines()
        .map(|line| {
            let digits: Vec<usize> = capture_all_matches(line, &Regex::new("[0-9]").unwrap())
                .into_iter()
                .map(|v| usize::from_str_radix(v, 10).unwrap())
                .collect();
            let parsed_number = format!("{}{}", digits.first().unwrap(), digits.last().unwrap());
            usize::from_str_radix(&parsed_number, 10).unwrap()
        })
        .reduce(|t, v| t + v)
        .unwrap()
}

fn part_2(input: &str) -> usize {
    const WRITTEN_LETTERS: [&str; 9] = [
        "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    ];
    let written_letters = Vec::from(WRITTEN_LETTERS);
    let raw_regex: String = format!("([0-9]|{})", written_letters.join("|").to_string());
    let regex: Regex = Regex::new(raw_regex.as_str()).unwrap();
    input
        .lines()
        .map(|line| {
            let digits: Vec<usize> = capture_all_matches(line, &regex)
                .into_iter()
                .map(|v| {
                    if v.len() == 1 {
                        return usize::from_str_radix(v, 10).unwrap();
                    }
                    return WRITTEN_LETTERS.iter().position(|&x| x == v).unwrap() + 1;
                })
                .collect();
            let parsed_number = format!("{}{}", digits.first().unwrap(), digits.last().unwrap());
            usize::from_str_radix(&parsed_number, 10).unwrap()
        })
        .reduce(|t, v| t + v)
        .unwrap()
}

fn capture_all_matches<'a, 'b>(input: &'a str, regex: &'b Regex) -> Vec<&'a str> {
    let mut output: Vec<&'a str> = vec![];
    let mut index: usize = 0;
    let mut digit_match_option = regex.find_at(input, index);
    while digit_match_option.is_some() {
        let digit_match = digit_match_option.unwrap();
        index = digit_match.start() + 1;
        output.push(input.substring(digit_match.start(), digit_match.end()));
        digit_match_option = regex.find_at(input, index);
    }
    output
}

#[allow(dead_code)]
fn main() {
    let example_input = include_str!("./y2023_day01.example");
    let example_input2 = include_str!("./y2023_day01.example2");
    let input = include_str!("./y2023_day01.input");
    println!(
        "2023 day 1 {} {} {}",
        example_input.len(),
        example_input2.len(),
        input.len()
    );
    let part_1_example = part_1(example_input);
    assert_eq!(part_1_example, 142, "example part 1 not correct");
    let part_1_result = part_1(input);
    assert_eq!(part_1_result, 54573, "part 1 not correct");
    println!("part 1 - {}", part_1_result);

    let part_2_example = part_2(example_input2);
    assert_eq!(part_2_example, 281, "example part 2 not correct");

    let part_2_result = part_2(input);
    assert_eq!(part_2_result, 54591, "part 2 not correct");
    println!("part 2 - {}", part_2_result);
}
