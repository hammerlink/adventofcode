use std::error::Error;
use std::time::Instant;

// const BASE_PATTERN: [i8; 4] = [0, 1, 0, -1];

fn main() -> Result<(), Box<dyn Error>> {
    let raw_input = "59773419794631560412886746550049210714854107066028081032096591759575145680294995770741204955183395640103527371801225795364363411455113236683168088750631442993123053909358252440339859092431844641600092736006758954422097244486920945182483159023820538645717611051770509314159895220529097322723261391627686997403783043710213655074108451646685558064317469095295303320622883691266307865809481566214524686422834824930414730886697237161697731339757655485312568793531202988525963494119232351266908405705634244498096660057021101738706453735025060225814133166491989584616948876879383198021336484629381888934600383957019607807995278899293254143523702000576897358";
    let now = Instant::now();
    // run code
    let input = to_i8_array(raw_input)?;
    let output: Vec<i8> = execute_phases(input, 100)?.into_iter().take(8).collect();
    let diff = Instant::now() - now;


    println!("Output {:?}, {}ms", output, diff.as_millis());
    Ok(())
}

fn execute_phases(input: Vec<i8>, count: usize) -> Result<Vec<i8>, Box<dyn Error>> {
    let mut output = input;
    let usize_output_len = output.len();
    for _c in 0..count {
        let mut current: Vec<i8> = vec![0; 650];
        let mut build_up: i8 = 0;
        for r_idx in 0..usize_output_len {
            let idx = usize_output_len - 1 - r_idx;
            build_up = (build_up + output[idx]) % 10;
            current[idx] = build_up.abs();
        }
        output = current;
    }
    Ok(output)
}

fn to_i8_array<T: ToString>(input: T) -> Result<Vec<i8>, Box<dyn Error>> {
    let input_string = input.to_string();
    let mut output = Vec::with_capacity(input_string.len());
    for char in input_string.chars() {
        output.push(char.to_digit(10).ok_or("Invalid char")? as i8);
    }
    Ok(output)
}
