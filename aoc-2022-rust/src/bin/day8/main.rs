use aoc_lib::engine::input_engine::{read_day_input, read_day_input_example};

struct TreePatch {
    trees: Vec<Vec<Tree>>,
    max_x: usize,
    max_y: usize,
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
            println!("{} {}", i, row.iter().fold("".to_string(), |acc, x| {
                let mut v_h = "1";
                if !x.v_right { v_h = "0"; }
                format!("{} {}|{}", acc, x.height, v_h)
            }));
        }
    }


    pub fn calculate_trees_visibility(mut self) -> Self {
        // top
        for x in 0..self.max_x {
            let outer_top_element = self.trees.get_mut(0).unwrap().get_mut(x).unwrap();
            outer_top_element.v_top = true;
            let mut max_tree_height = outer_top_element.height;
            for y in 1..self.max_y {
                let next_tree = self.trees.get_mut(y).unwrap().get_mut(x).unwrap();
                if next_tree.height > max_tree_height {
                    next_tree.v_top = true;
                    max_tree_height = next_tree.height;
                } else {
                    next_tree.v_top = false;
                }
            }
        }
        // left
        for y in 0..self.max_y {
            let outer_left_tree = self.trees.get_mut(y).unwrap().get_mut(0).unwrap();
            outer_left_tree.v_left = true;
            let mut max_tree_height = outer_left_tree.height;
            for x in 1..self.max_x {
                let next_tree = self.trees.get_mut(y).unwrap().get_mut(x).unwrap();
                if next_tree.height > max_tree_height {
                    next_tree.v_left = true;
                    max_tree_height = next_tree.height;
                } else {
                    next_tree.v_left = false;
                }

            }
        }
        // bottom 
        for x in 0..self.max_x {
            let outer_bottom_element = self.trees.get_mut(self.max_y - 1).unwrap().get_mut(x).unwrap();
            outer_bottom_element.v_bottom = true;
            let mut max_tree_height = outer_bottom_element.height;
            for y in 1..self.max_y {
                let next_tree = self.trees.get_mut(self.max_y - 1 - y).unwrap().get_mut(x).unwrap();
                if next_tree.height > max_tree_height {
                    next_tree.v_bottom = true;
                    max_tree_height = next_tree.height;
                } else {
                    next_tree.v_bottom = false;
                }
            }
        } 
        // right 
        for y in 0..self.max_y {
            let outer_right_tree = self.trees.get_mut(y).unwrap().get_mut(self.max_x - 1).unwrap();
            outer_right_tree.v_right = true;
            let mut max_tree_height = outer_right_tree.height;
            for x in 1..self.max_x {
                let next_tree = self.trees.get_mut(y).unwrap().get_mut(self.max_x - 1 - x).unwrap();
                if next_tree.height > max_tree_height {
                    next_tree.v_right = true;
                    max_tree_height = next_tree.height;
                } else {
                    next_tree.v_right = false;
                }

            }
        }
        self
    }

    pub fn count_visible_trees(&self) -> usize {
        let mut output: usize = 0;
        for x in 0..self.max_x {
            for y in 0..self.max_y {
                if self.trees[y][x].is_visible() {
                    output += 1;
                }
            }
        }
        output
    }

    pub fn calculate_best_view_score(&self) -> u32 {
        let mut output: u32 = 0;
        for x in 0..self.max_x {
            for y in 0..self.max_y {
                if x == 2 && y == 3 {
                    let _test = true;
                }
                let score = self.calculate_view_score(x, y);                
                if score > output { output = score; }    
            }
        }
        output
    }

    pub fn calculate_view_score(&self, x: usize, y: usize) -> u32 {
        let score_right = self.calculate_view_score_right(x, y);
        if score_right == 0 { return 0; }

        let score_left = self.calculate_view_score_left(x, y);
        if score_left == 0 { return 0; }

        let score_bottom = self.calculate_view_score_bottom(x, y);
        if score_bottom == 0 { return 0; }

        let score_top = self.calculate_view_score_top(x, y);
        if score_top == 0 {return 0;}

        score_right * score_left * score_bottom * score_top
    }

    pub fn calculate_view_score_right(&self, x_start: usize, y_start: usize) -> u32 {
        if x_start >= self.max_x - 1 { return 0; }
        if x_start == self.max_x - 2 { return 1; }
        let mut output: u32 = 0;
        let max_height = self.trees[y_start][x_start].height;
        for x in (x_start + 1)..self.max_x {
            output += 1;            
            if self.trees[y_start][x].height >= max_height { break; }        
        }
        output
    }

    pub fn calculate_view_score_left(&self, x_start: usize, y_start: usize) -> u32 {
        if x_start == 0 { return 0; }
        if x_start == 1 { return 1; }
        let mut output: u32 = 0;
        let max_height = self.trees[y_start][x_start].height;
        for x in 0..=(x_start - 1) {
            output += 1;
            if self.trees[y_start][x_start - 1 - x].height >= max_height { break; }       
        }
        output
    }

    pub fn calculate_view_score_bottom(&self, x_start: usize, y_start: usize) -> u32 {
        if y_start >= self.max_y - 1 { return 0; }
        if y_start == self.max_y - 2 { return 1; }
        let mut output: u32 = 0;
        let max_height = self.trees[y_start][x_start].height;
        for y in (y_start + 1)..self.max_y {
            output += 1;
            if self.trees[y][x_start].height >= max_height { break; }
        }
        output
    }

    pub fn calculate_view_score_top(&self, x_start: usize, y_start: usize) -> u32 {
        if y_start == 0 { return 0; }
        if y_start == 1 { return 1; }
        let mut output: u32 = 0;
        let max_height = self.trees[y_start][x_start].height;
        for y in 0..=(y_start - 1) {
            output += 1;   
            if self.trees[y_start - 1 - y][x_start].height >= max_height { break; }     
        }
        output
    }
}

impl Tree {
    pub fn is_visible(&self) -> bool {
        self.v_top || self.v_left || self.v_right || self.v_bottom
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
        max_y: input.len(),
        max_x: input.get(0) .unwrap().len(),
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
    let mut result = parse_input(input);
    result = result.calculate_trees_visibility();
    // result.print();
    println!("{}", &result.count_visible_trees())
}

fn part_2(input: &Vec<String>) {
    let result = parse_input(input);
    println!("{}", result.calculate_best_view_score())
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
    // 50160 is too low
}

