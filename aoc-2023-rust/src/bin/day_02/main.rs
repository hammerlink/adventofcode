use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref GAME_REGEX: Regex = Regex::new(r"Game\s+([0-9]+): (.*)$").unwrap();
}
enum RGB {
    Red,
    Green,
    Blue,
}
struct Game {
    index: usize,
    red: usize,
    green: usize,
    blue: usize,
}

fn get_rgb(rgb: &str) -> RGB {
    match rgb {
        "red" => RGB::Red,
        "green" => RGB::Green,
        "blue" => RGB::Blue,
        _ => RGB::Red,
    }
}

fn parse_game(line: &str) -> Game {
    let game_match = GAME_REGEX.captures(line).unwrap();
    let index = usize::from_str_radix(&game_match[1], 10).unwrap();
    let mut red_counter: usize = 0;
    let mut green_counter: usize = 0;
    let mut blue_counter: usize = 0;
    game_match[2].split("; ").into_iter().for_each(|set_str| {
        set_str.split(", ").into_iter().for_each(|pick_str| {
            let pieces: Vec<&str> = pick_str.split(" ").collect();
            let amount = usize::from_str_radix(pieces[0], 10).unwrap();
            let color = get_rgb(pieces[1]);
            match color {
                RGB::Red => {
                    if amount > red_counter {
                        red_counter = amount;
                    }
                }
                RGB::Green => {
                    if amount > green_counter {
                        green_counter = amount;
                    }
                }
                _ => {
                    if amount > blue_counter {
                        blue_counter = amount;
                    }
                }
            };
        });
    });
    Game {
        index,
        red: red_counter,
        green: green_counter,
        blue: blue_counter,
    }
}

#[test]
fn test_parse_game() {
    let example = "Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red";
    let game = parse_game(example);
    assert_eq!(game.index, 3);
}

fn is_game_possible(game: &Game) -> bool {
    return game.red <= 12 && game.green <= 13 && game.blue <= 14;
}

fn part_1(input: &str) -> usize {
    let games: Vec<Game> = input.lines().map(|l| parse_game(l)).collect();
    games
        .into_iter()
        .filter(is_game_possible)
        .fold(0, |total, game| total + game.index)
}

fn part_2(input: &str) -> usize {
    let games: Vec<Game> = input.lines().map(|l| parse_game(l)).collect();
    games
        .into_iter()
        .fold(0, |total, game| total + game.red * game.green * game.blue)
}

#[allow(dead_code)]
fn main() {
    let example_input = include_str!("../../../../src/2023/data/y2023_day02.example");
    let input = include_str!("../../../../src/2023/data/y2023_day02.input");
    println!("2023 day 1 {} {}", example_input.len(), input.len());
    let part_1_example = part_1(example_input);
    assert_eq!(part_1_example, 8, "example part 1 not correct");
    let part_1_result = part_1(input);
    assert_eq!(part_1_result, 2237, "part 1 not correct");
    println!("part 1 - {}", part_1_result);

    let part_2_example = part_2(example_input);
    assert_eq!(part_2_example, 2286, "example part 2 not correct");

    let part_2_result = part_2(input);
    assert_eq!(part_2_result, 66681, "part 2 not correct");
    println!("part 2 - {}", part_2_result);
}
