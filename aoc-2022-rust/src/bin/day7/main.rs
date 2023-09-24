use std::borrow::{Borrow, BorrowMut};
use std::cell::{RefCell};
use std::rc::{Rc};
use lazy_static::lazy_static;
use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};
use regex::Regex;

struct FileSystem {
    root: NodeLink,
}

impl FileSystem {
    pub fn new() -> Self {
        FileSystem {
            root: Rc::new(RefCell::new(FSEntry {
                name: String::from(""),
                total_path: "/".to_string(),
                is_directory: true,
                is_dir_size_calculated: false,
                total_size: 0,
                children: Vec::new(),
                parent: None,
            })),
        }
    }
}

#[test]
fn test_split() {
    let path = "/test/a/b".trim_start_matches("/");
    for (i, part) in path.split("/").into_iter().enumerate() {
        println!("{} - {}", i, part);
    }
}

type NodeLink = Rc<RefCell<FSEntry>>;

struct FSEntry {
    name: String,
    total_path: String,
    is_directory: bool,
    total_size: u128,
    is_dir_size_calculated: bool,
    children: Vec<NodeLink>,
    parent: Option<NodeLink>,
}

impl FSEntry {
    pub fn add_child(&mut self, child: NodeLink) {
        self.children.push(child);
    }

    pub fn get_child(&self, name: String) -> Option<NodeLink> {
        for child_ref in self.children.iter() {
            let child = child_ref.as_ref().borrow();
            if child.name == name { return Some(child_ref.clone()); }
        }
        None
    }

    pub fn calculate_size(&mut self) -> u128 {
        if !self.is_directory || self.is_dir_size_calculated { return self.total_size; }
        let mut total_size: u128 = 0;
        for child_ref in self.children.iter() {
            total_size += child_ref.as_ref().borrow_mut().calculate_size();
        }
        self.total_size = total_size;
        self.total_size
    }
}

struct TerminalLine {
    parts: Vec<String>,
    is_command: bool,
}

fn parse_input(input: &Vec<String>) -> FileSystem {
    let lines: Vec<TerminalLine> = input.iter().map(|x| parse_terminal_line(x)).collect();

    let mut current_path = "/".to_string();
    let tree = FileSystem::new();

    let root = (&tree.root).clone();
    let mut current_node = root.clone();
    let mut ls_mode = false;

    for line in lines.iter() {
        if line.is_command {
            ls_mode = line.parts[1] == "ls";
            if line.parts[1] == "cd" {
                current_path = parse_cd_command(&current_path, &line);
                let argument = (&line.parts[2]).clone();
                current_node = match argument.as_str() {
                    ".." => current_node.as_ref().borrow().parent.clone().unwrap(),
                    "/" => root.clone(),
                    _ => current_node.as_ref().borrow().get_child(argument).unwrap()
                }
            }
            continue;
        } else {
            let is_directory = &line.parts[0] == "dir";
            let mut total_size: u128 = 0;
            if !is_directory { total_size = u128::from_str_radix(&line.parts[0], 10).unwrap(); }

            let total_path = join_path_parts(&current_path, &line.parts.get(1).unwrap());
            current_node.as_ref().borrow_mut().children.push(Rc::new(RefCell::new(FSEntry {
                name: line.parts[1].clone(),
                is_directory,
                is_dir_size_calculated: false,
                total_path,
                total_size,
                children: vec![],
                parent: Some(current_node.clone()),
            })));
        }
    }

    root.as_ref().borrow_mut().calculate_size();
    tree
}

fn parse_cd_command(current_path: &String, terminal_line: &TerminalLine) -> String {
    join_path_parts(current_path, terminal_line.parts.get(2).unwrap())
}

fn join_path_parts(current_path: &String, path_argument: &String) -> String {
    if path_argument == ".." {
        lazy_static! {
            static ref RE: Regex = Regex::new(r"/[^/]+/?$").unwrap();
        }
        return RE.replace(current_path, "").to_string();
    }
    if path_argument.starts_with("/") { return path_argument.clone(); }
    let mut output = current_path.clone();
    if !output.ends_with("/") { output = output + "/"; }
    output + path_argument
}

fn parse_terminal_line(terminal_line: &str) -> TerminalLine {
    let parts: Vec<String> = terminal_line.split(" ").map(|x| x.to_string()).collect();
    let is_command = parts[0] == "$";
    TerminalLine {
        parts,
        is_command,
    }
}

fn calculate_total_part_1(node: NodeLink, total: u128) -> u128 {
    let mut output = total;
    let children = &node.as_ref().borrow().children;
    for child_ref in children.iter() {
        let child = child_ref.as_ref().borrow();
        if child.is_directory && child.total_size < 100000 { output += child.total_size; }
        output = calculate_total_part_1(child_ref.clone(), output);
    }
    output
}

fn part_1(input: &Vec<String>) {
    let file_system = parse_input(input);
    println!("{}", calculate_total_part_1((&file_system.root).clone(), 0))
}

fn calculate_total_part_2(node: NodeLink, required_space: u128, smallest_directory_size: u128) -> u128 {
    let mut output = smallest_directory_size;
    let children = &node.as_ref().borrow().children;
    for child_ref in children.iter().filter(|x| {
        let child = x.as_ref().borrow();
        child.is_directory && child.total_size >= required_space
    }) {
        let child = child_ref.as_ref().borrow();
        let total_size = child.total_size;
        if total_size < output {
            output = total_size;
        }

        let new_result = calculate_total_part_2(child_ref.clone(), required_space, output);
        if new_result < output { output = new_result; }
    }
    output
}

fn part_2(input: &Vec<String>) {
    let result = parse_input(input);
    let necessary_space = 30000000 - (70000000 - result.root.as_ref().borrow().total_size);
    println!("{}", calculate_total_part_2((&result.root).clone(), necessary_space, result.root.as_ref().borrow().total_size))
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
