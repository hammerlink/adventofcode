use std::fmt;
use std::fs;

#[derive(Debug)]
enum GameOptions {
    Rock,
    Paper,
    Scissors,
    LoseRock,
    DrawPaper,
    WinScissors,
}

impl fmt::Display for GameOptions {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            GameOptions::Rock => write!(f, "Rock"),
            GameOptions::Paper => write!(f, "Paper"),
            GameOptions::Scissors => write!(f, "Scissors"),
            GameOptions::LoseRock => write!(f, "LoseRock"),
            GameOptions::DrawPaper => write!(f, "DrawPaper"),
            GameOptions::WinScissors => write!(f, "WinScissors"),
        }
    }
}

#[derive(Debug)]
struct GameCommand {
    game_option: Vec<GameOptions>,
    raw_value: String,
}

impl fmt::Display for GameCommand {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "value: {} - parsed option: {:?}",
            &self.raw_value, &self.game_option
        )
    }
}

fn parse_input(input_path: &str) -> Vec<GameCommand> {
    let mut output: Vec<GameCommand> = Vec::new();
    let contents = fs::read_to_string(input_path).expect("Should have been able to read the file");
    let raw_input: Vec<&str> = contents.split('\n').collect();
    for s in raw_input {
        if s.is_empty() {
            continue;
        }
        let new_command = GameCommand {
            game_option: s.split(' ').map(parse_column).collect(),
            raw_value: s.to_string(),
        };
        // println!("{}", new_command);
        output.push(new_command);
    }
    output
}

fn parse_column(input: &str) -> GameOptions {
    match input.clone() {
        "A" => GameOptions::Rock,
        "B" => GameOptions::Paper,
        "C" => GameOptions::Scissors,
        "X" => GameOptions::LoseRock,
        "Y" => GameOptions::DrawPaper,
        "Z" => GameOptions::WinScissors,
        _ => panic!("mismatching column : {}", input),
    }
}

fn get_option_score(option: &GameOptions) -> u32 {
    match option {
        GameOptions::LoseRock => 1,
        GameOptions::DrawPaper => 2,
        GameOptions::WinScissors => 3,
        _ => 0,
    }
}

fn get_game_score(elf_option: &GameOptions, your_option: &GameOptions) -> u32 {
    match your_option {
        GameOptions::LoseRock => {
            match elf_option {
                GameOptions::Rock => 3,
                GameOptions::Paper => 0,
                GameOptions::Scissors => 6,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            }
        }
        GameOptions::DrawPaper => {
            match elf_option {
                GameOptions::Rock => 6,
                GameOptions::Paper => 3,
                GameOptions::Scissors => 0,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            }
        }
        GameOptions::WinScissors => {
            match elf_option {
                GameOptions::Rock => 0,
                GameOptions::Paper => 6,
                GameOptions::Scissors => 3,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            }
        }
        _ => panic!("game match issue : {} : {}", elf_option, your_option),
    }
}

fn part2_get_game_score(game_command: &GameCommand) -> u32 {
    assert!(game_command.game_option.len() as u32 == 2);
    let elf_option = &game_command.game_option[0];
    let your_option = &game_command.game_option[1];

    match your_option {
        GameOptions::LoseRock => {
            let game_score = 0;
            let your_option: GameOptions = match elf_option {
                GameOptions::Rock => GameOptions::WinScissors,
                GameOptions::Paper => GameOptions::LoseRock,
                GameOptions::Scissors => GameOptions::DrawPaper,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            };
            game_score + get_option_score(&your_option)
        }
        GameOptions::DrawPaper => {
            let game_score = 3;
            let your_option: GameOptions = match elf_option {
                GameOptions::Rock => GameOptions::LoseRock,
                GameOptions::Paper => GameOptions::DrawPaper,
                GameOptions::Scissors => GameOptions::WinScissors,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            };
            game_score + get_option_score(&your_option)
        }
        GameOptions::WinScissors => {
            let game_score = 6;
            let your_option: GameOptions = match elf_option {
                GameOptions::Rock => GameOptions::DrawPaper,
                GameOptions::Paper => GameOptions::WinScissors,
                GameOptions::Scissors => GameOptions::LoseRock,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            };
            game_score + get_option_score(&your_option)
        }
        _ => panic!("game match issue : {} : {}", elf_option, your_option),
    }
}

fn get_score_part_1(game_command: &GameCommand) -> u32 {
    assert!(game_command.game_option.len() as u32 == 2);
    let elf_action = &game_command.game_option[0];
    let reasoned_action = &game_command.game_option[1];

    let option_score = get_option_score(reasoned_action);
    let game_score = get_game_score(elf_action, reasoned_action);
    option_score + game_score
}

#[allow(dead_code)]
fn main() {
    let input_example_path = "src/bin/day2/input.example";
    let input_path = "src/bin/day2/input";

    println!("Part 1 - example input");
    let game_example = parse_input(input_example_path);
    let example_score = game_example
        .into_iter()
        .fold(0, |t, v| t + get_score_part_1(&v));
    assert!(example_score == 15);

    println!("Part 1 - input");
    let game = parse_input(input_path);
    let score = game.into_iter().fold(0, |t, v| t + get_score_part_1(&v));
    println!("part 1 - score {}", score);

    println!("Part 2 - example input");
    let example_part2_score = parse_input(input_example_path)
        .into_iter()
        .fold(0, |t, v| t + part2_get_game_score(&v));
    assert!(example_part2_score == 12);

    println!("Part 2 - input");
    let part2_score = parse_input(input_path)
        .into_iter()
        .fold(0, |t, v| t + part2_get_game_score(&v));
    println!("part 2 - score {}", part2_score);
}
