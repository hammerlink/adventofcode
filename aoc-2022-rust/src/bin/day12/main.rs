fn part_1(input: &str) {
}

fn part_2(input: &str) {
}

#[test]
fn test_values_local() {
    let test = "my test value";
    println!("test {}", test);
    println!("Test 2");
}

fn main() {
    let raw_input_example = include_str!("input.example");
    let raw_input = include_str!("input");

    println!("Part 1 - example input");
    part_1(raw_input_example);

    println!("Part 1 - input");
    part_1(raw_input);

    println!("Part 2 - example input");
    part_2(raw_input_example);

    println!("Part 2 - input");
    part_2(raw_input);
}

