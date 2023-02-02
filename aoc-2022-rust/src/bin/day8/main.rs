use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};

struct TreePatch {
    trees: Vec<Vec<Tree>>,
}

struct Tree {
    x: usize,
    y: usize,
    height: u32,
    v_left: bool,
    v_right: bool,
    v_top: bool,
    v_bottom: bool,
}

impl TreePatch {
    pub fn print(&self) {
        for (i, row) in self.trees.iter().enumerate() {
            println!("{} {}", i, row.iter().fold("".to_string(), |acc, x| format!("{} {}", acc, x.height)));
        }
    }
}

#[test]
fn test_split() {
    let path = "12345";
    println!("custom test");
    for (i, part) in path.chars().into_iter().map(|x| x.to_digit(10).unwrap()).enumerate() {
        println!("{} - {}", i, part);
    }
}

fn parse_input(input: &Vec<String>) -> TreePatch {
    TreePatch {
        trees: input.into_iter().enumerate().map(|(y, tree_line)| {
            tree_line.chars().into_iter().enumerate().map(|(x, height)| Tree {
                x,
                y,
                height: height.to_digit(10).unwrap(),
                v_left: false,
                v_top: false,
                v_right: false,
                v_bottom: false,
            }).collect() 
        }).collect(),
    }
}

fn part_1(input: &Vec<String>) {
    let result = parse_input(input);
    println!("{}", 0)
}

fn part_2(input: &Vec<String>) {
    let result = parse_input(input);
    println!("{}", 0)
}

fn main() {
    let day_name = file!();
    let input = read_day_input(&day_name);
    let example_input = read_day_input_example(&day_name);

    println!("Part 1 - example input");
    part_1(&example_input);

    println!("Part 1 - input");
    part_1(&input);

    println!("Part 2 - example input");
    part_2(&example_input);

    println!("Part 2 - input");
    part_2(&input);
}

