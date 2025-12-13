const EXAMPLE_INPUT: &str = include_str!("./y2025_day06.example");
const INPUT: &str = include_str!("./y2025_day06.input");

mod part1 {
    #[derive(PartialEq)]
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
        numbers: Vec<u64>,
        operator: Operator,
    }

    impl Operation {
        fn new(operator: Operator) -> Self {
            Operation {
                numbers: vec![],
                operator,
            }
        }
        fn execute_calculation(&self) -> u64 {
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

    pub fn execute_part1(input: &str) -> u64 {
        let operations = parse_input(input);
        operations.iter().map(Operation::execute_calculation).sum()
    }

    pub fn execute_part2(input: &str) -> u64 {
        0
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
}

#[test]
fn part2_example() {
    let result = part1::execute_part2(EXAMPLE_INPUT);
    println!("{result}");
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
