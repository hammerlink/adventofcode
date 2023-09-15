use regex::Regex;
use std::borrow::{Borrow, Cow};
use std::fs;

// TODO include_str! https://doc.rust-lang.org/std/macro.include_str.html#
// this should be an improvement

pub fn read_input_file(input_path: String) -> Vec<String> {
    fs::read_to_string(&input_path)
        .expect(format!("Should have been able to read the file {}", input_path).as_str())
        .lines()
        .map(|x| x.to_string())
        .collect::<Vec<String>>()
}

fn get_binary_folder(file_path: &str) -> Cow<str> {
    let re = Regex::new(r"/[^/]+$").unwrap();
    re.replace(file_path, "")
}

fn get_input_path(directory: &str, file: &str) -> String {
    format!("{}/{}", directory, file)
}

pub fn read_day_input(file_path: &str) -> Vec<String> {
    let day_input_path = get_input_path(get_binary_folder(file_path).borrow(), "input");
    println!("{}", &day_input_path);
    read_input_file(day_input_path)
}

pub fn read_day_input_example(file_path: &str) -> Vec<String> {
    let day_input_path = get_input_path(get_binary_folder(file_path).borrow(), "input.example");
    println!("{}", &day_input_path);
    read_input_file(day_input_path)
}
