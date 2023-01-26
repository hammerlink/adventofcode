use std::fs;

#[derive(Clone)]
struct Elf {
    food: u32,
}

fn parse_input(input_path: &str) -> Vec<Elf> {
    let contents = fs::read_to_string(input_path)
        .expect("Should have been able to read the file"); 
    let raw_input: Vec<&str> = contents.split("\n").collect();
    
    let mut elves: Vec<Elf> = Vec::new();
    let mut current_elf: Elf = Elf { 
        food: 0,
    };
    let mut largest_total_food: u32 = 0;

    for s in raw_input {
        let char_amount = s.len();
        if char_amount > 0 {
            let food_amount: u32 = s.parse().expect("Number desired"); 
            current_elf.food += food_amount;
        } else {
            elves.push(current_elf.clone());
            if current_elf.food > largest_total_food {
                largest_total_food = current_elf.food;
            }
            current_elf = Elf {
                food: 0,
            };
        }

    }
    println!("Largest carried total food: {}", largest_total_food);
    return elves;
}

fn calculate_top_tree_total(elves: &mut Vec<Elf>) {
    elves.sort_by(|a, b| b.food.cmp(&a.food));

    let top_tree = &elves[0..3];
    let total = top_tree.into_iter().fold(0, |total, value| total + value.food);

    println!("total food of top tree: {}", total);
}

fn main() {
    let input_example_path = "src/bin/day1/input.example";
    let input_path = "src/bin/day1/input";
    
    // input_path.len()
    println!("Part 1 - example input");
    let mut elves_example = parse_input(&input_example_path);

    println!("Part 1 - input");
    let mut elves = parse_input(&input_path);

    println!("Part 2 - example input");
    calculate_top_tree_total(&mut elves_example);

    println!("Part 2 - input");
    calculate_top_tree_total(&mut elves);

}

