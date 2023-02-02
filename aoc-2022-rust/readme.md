# AOC 2022 RUST

This year I want to learn rust. That is why I am gonna try to complete the AOC of 2022 by doing 2 challenges.

First of all I am gonna learn rust while completing all the puzzles.

Second of all I while do this all in a new IDE, neovim.


## Running a day
```bash 
cargo run --bin day1
```

### Rust script
https://crates.io/crates/rust-script

### Rust compiling
Found a new way of running rust files:
```
rustc src/days/day3.rs --out-dir target && ./target/day3

```
This will run any rust file as long as it contains a fn main().
Very similar to node running.



## Debugging rust
A first attempt at debugging in vim was successfull by using the following blog:
https://togglebit.io/posts/debugging-rust-in-vim/

It' still giving a couple of issues related to the window splitting of my nvchad configuration.
To be continued.


## Running test to check code
```
cargo test --bin day8 test_split -- --show-output
```
