const EXAMPLE_INPUT: &str = include_str!("./y2025_day06.example");
const INPUT: &str = include_str!("./y2025_day06.input");

mod part1 {
    struct Range {
        start_i: usize,
        end_i: usize,
    }
    #[derive(PartialEq, Debug)]
    enum Operator {
        Plus,
        Multiply,
    }
    impl Operator {
        fn new(piece: &str) -> Self {
            match piece {
                "+" => Operator::Plus,
                "*" => Operator::Multiply,
                _ => panic!("invalid operator value"),
            }
        }
    }

    struct Operation {
        numbers: Vec<u128>,
        operator: Operator,
        range: Range,
    }

    impl Operation {
        fn new(operator: Operator) -> Self {
            Operation {
                numbers: vec![],
                operator,
                range: Range {
                    start_i: 0,
                    end_i: 0,
                },
            }
        }
        fn execute_calculation(&self) -> u128 {
            self.numbers
                .clone()
                .into_iter()
                .reduce(|acc, e| {
                    if self.operator == Operator::Plus {
                        acc + e
                    } else {
                        acc * e
                    }
                })
                .unwrap()
        }
    }

    fn parse_input(input: &str) -> Vec<Operation> {
        let mut raw_pieces: Vec<Vec<&str>> = input
            .lines()
            .map(|l| l.split(' ').filter(|x| !x.is_empty()).collect())
            .collect();
        let operator_line = raw_pieces.pop().unwrap();

        let mut operations = vec![];

        for i in 0..operator_line.iter().len() {
            let mut operation = Operation::new(Operator::new(operator_line.get(i).unwrap()));
            for raw_piece in raw_pieces.iter() {
                operation
                    .numbers
                    .push(raw_piece.get(i).unwrap().parse().unwrap());
            }
            operations.push(operation);
        }

        operations
    }

    pub fn execute_part1(input: &str) -> u128 {
        let operations = parse_input(input);
        operations.iter().map(Operation::execute_calculation).sum()
    }

    fn parse_input2(input: &str) -> Vec<Operation> {
        let mut raw_pieces: Vec<&str> = input.lines().collect();
        let operator_line = raw_pieces.pop().unwrap().to_string();

        let mut operations = vec![];
        let mut current_operation: Operation = Operation::new(Operator::Plus);
        for (i, v) in operator_line.chars().enumerate() {
            let is_space = v == ' ';
            if !is_space {
                if i > 1 {
                    current_operation.range.end_i = i - 2;
                    operations.push(current_operation);
                }
                current_operation = Operation::new(Operator::new(&v.to_string()));
                current_operation.range.start_i = i;
            }
        }
        current_operation.range.end_i = operator_line.len() - 1;
        operations.push(current_operation);

        for operation in operations.iter_mut() {
            for i in operation.range.start_i..=operation.range.end_i {
                let mut num_string: String = "".to_string();
                for piece in raw_pieces.iter() {
                    let char = &piece[i..=i];
                    if char != " " {
                        num_string += char;
                    }
                }
                operation.numbers.push(num_string.parse().unwrap());
            }
        }

        operations
    }

    pub fn execute_part2(input: &str) -> u128 {
        let operations = parse_input2(input);
        operations.iter().map(Operation::execute_calculation).sum()
    }
}

#[test]
fn part1_example() {
    let result = part1::execute_part1(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 4277556);
}

#[test]
fn part1_input() {
    let result = part1::execute_part1(INPUT);
    println!("{result}");
    assert_eq!(result, 4076006202939);
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
    assert_eq!(result, 3263827);
}

#[test]
fn part2_input() {
    let result = part1::execute_part2(INPUT);
    println!("{result}");
}

fn main() {
    part1::execute_part1(EXAMPLE_INPUT);
    part1::execute_part1(INPUT);
    part1::execute_part2(EXAMPLE_INPUT);
}
