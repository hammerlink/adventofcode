use std::fs;

#[derive(Clone)]
struct Elf {
    food: u32,
}
fn main() {
    // let input_path = "src/bin/day1/input.example";
    let input_path = "src/bin/day1/input";
    let contents = fs::read_to_string(input_path)
        .expect("Should have been able to read the file"); 
    let raw_input: Vec<&str> = contents.split("\n").collect();
    
    let mut elves: Vec<Elf> = Vec::new();
    let mut current_elf: Elf = Elf { 
        food: 0,
    };
    let mut largestTotalFood: u32 = 0;

    for s in raw_input {
        let char_amount = s.len();
        if char_amount > 0 {
            let food_amount: u32 = s.parse().expect("Number desired"); 
            current_elf.food += food_amount;
            println!("food_amount: {} - current_elf food: {}", food_amount, current_elf.food);
        } else {
            elves.push(current_elf.clone());
            if current_elf.food > largestTotalFood {
                largestTotalFood = current_elf.food;
            }
            current_elf = Elf {
                food: 0,
            };
            println!("new elf, elves total {}", elves.len());
        }

    }
    println!("Largest carried total food: {}", largestTotalFood);
}

