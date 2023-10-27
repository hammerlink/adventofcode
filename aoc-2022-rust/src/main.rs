use days::day_16::main_16::day_16_part_1_run;
use std::time::SystemTime;

mod days;
mod engine;

fn main() {
    let start = SystemTime::now();
    day_16_part_1_run();
    let duration_ms = SystemTime::now().duration_since(start);
    println!("{:?}", duration_ms);
}
