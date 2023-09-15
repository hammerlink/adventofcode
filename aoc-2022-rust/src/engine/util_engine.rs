pub fn print_fixed_length_number(input: isize, size: usize) -> String {
    let mut output = input.to_string();
    while output.len() < size {
        output = format!("{}{}", ' ', output);
    }
    return output;
}
