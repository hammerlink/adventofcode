use std::fs;
use std::fmt;

#[derive(Debug)]
enum GameOptions {
    Rock,
    Paper,
    Scissors,
    ReasonedRock,
    ReasonedPaper,
    ReasonedScissors,
}

impl fmt::Display for GameOptions {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
       match *self {
           GameOptions::Rock => write!(f, "Rock"),
           GameOptions::Paper => write!(f, "Paper"),
           GameOptions::Scissors => write!(f, "Scissors"),
           GameOptions::ReasonedRock => write!(f, "ReasonedRock"),
           GameOptions::ReasonedPaper => write!(f, "ReasonedPaper"),
           GameOptions::ReasonedScissors => write!(f, "ReasonedScissors"),
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
        return write!(f, "value: {} - parsed option: {:?}", &self.raw_value, &self.game_option);
    }
}

fn parse_input(input_path: &str) -> Vec<GameCommand> {
    let mut output: Vec<GameCommand> = Vec::new();
    let contents = fs::read_to_string(input_path)
        .expect("Should have been able to read the file"); 
    let raw_input: Vec<&str> = contents.split("\n").collect();
    for s in raw_input {
        if s.len() == 0 {continue;}
        let new_command = GameCommand {
            game_option: s.split(" ").map(|x| parse_column(x)).collect(),
            raw_value: s.to_string(),
        };
        // println!("{}", new_command);
        output.push(new_command);
    }
    return output;
}

fn parse_column(input: &str) -> GameOptions {
    return match input.clone() {
        "A" => GameOptions::Rock,
        "B" => GameOptions::Paper,
        "C" => GameOptions::Scissors,
        "X" => GameOptions::ReasonedRock,
        "Y" => GameOptions::ReasonedPaper,
        "Z" => GameOptions::ReasonedScissors,
        _ => panic!("mismatching column : {}", input)
    }
}

fn get_option_score(option: &GameOptions) -> u32 {
    return match option {
        GameOptions::ReasonedRock => 1,
        GameOptions::ReasonedPaper => 2,
        GameOptions::ReasonedScissors => 3,
        _ => 0,
    };
}

fn get_game_score(elf_option: &GameOptions, your_option: &GameOptions) -> u32 {
    match your_option {
        GameOptions::ReasonedRock => {
            return match elf_option {
                GameOptions::Rock => 3,
                GameOptions::Paper => 0,
                GameOptions::Scissors => 6,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            }
        },
        GameOptions::ReasonedPaper => {
            return match elf_option {
                GameOptions::Rock => 6,
                GameOptions::Paper => 3,
                GameOptions::Scissors => 0,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            }
        },
        GameOptions::ReasonedScissors => {
            return match elf_option {
                GameOptions::Rock => 0,
                GameOptions::Paper => 6,
                GameOptions::Scissors => 3,
                _ => panic!("game match issue : {} : {}", elf_option, your_option),
            }
        },
        _ => panic!("game match issue : {} : {}", elf_option, your_option),
    }
}

fn get_score(game_command: &GameCommand) -> u32 {
    assert!(game_command.game_option.len() as u32 == 2);
    let elf_action = &game_command.game_option[0];
    let reasoned_action = &game_command.game_option[1];

    let option_score = get_option_score(reasoned_action);
    let game_score = get_game_score(elf_action, reasoned_action);
    return option_score + game_score;
}

fn main() {
    let input_example_path = "src/bin/day2/input.example";
    let input_path = "src/bin/day2/input";
    
    println!("Part 1 - example input");
    let game_example = parse_input(&input_example_path);
    let example_score = game_example.into_iter().fold(0, |t, v| t + get_score(&v));
    assert!(example_score == 15);

    println!("Part 1 - input");
    let game = parse_input(&input_path);
    let score = game.into_iter().fold(0, |t, v| t + get_score(&v));
    println!("part 1 - score {}", score);

    println!("Part 2 - example input");
    // calculate_top_tree_total(&mut elves_example);

    println!("Part 2 - input");
    // calculate_top_tree_total(&mut elves);

 }


