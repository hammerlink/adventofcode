use std::fs;
// use std::collections::HashMap;


fn parse_input(input_path: &str) {
    let contents = fs::read_to_string(input_path)
        .expect("Should have been able to read the file"); 
    let raw_input: Vec<&str> = contents.split("\n").collect();
}

fn main() {
    // let mut symbol_map_first_column = object!{
    //     rock: : "X",
    //     paper: "Y",
    //     scissors: "Z",
    // };

    let input_example_path = "src/bin/day2/input.example";
    let input_path = "src/bin/day2/input";
    
    println!("Part 1 - example input");
    let mut elves_example = parse_input(&input_example_path);

    println!("Part 1 - input");
    // let mut elves = parse_input(&input_path);

    println!("Part 2 - example input");
    // calculate_top_tree_total(&mut elves_example);

    println!("Part 2 - input");
    // calculate_top_tree_total(&mut elves);

}


